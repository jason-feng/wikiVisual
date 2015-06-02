#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# =============================================================================
#  Date (May 29, 2015)
#  Author: Jason Feng (jason21feng@gmail.com).

# =============================================================================
#  Copyright (c) 2015. Jason Feng (jason21feng@gmail.com).
# =============================================================================
#
# Extracts a number of pageIds given a list and parses each of the pages for
# links to calculate page rank
#
# Argument One: Wikipedia XML file
# Argument Two: File of a list of pageIds
# =============================================================================

import re
import extractPage
import argparse
import sys, os.path
import csv
from collections import defaultdict

def page_rank(wikiDump, directorsFile):

    # Save pageIds into list
    listRussianFilmDirectors = [pageId.rstrip('\n') for pageId in open(directorsFile)]
    listRussianFilmDirectors = sorted(listRussianFilmDirectors, key=int)
    listRussianFilmDirectorsNoBirth = []
    #Pages is the full page of each pageid, #pageToTitle is the title of every page
    pages, pageToTitle, visited = extractPage.process_data(wikiDump,listRussianFilmDirectors)

    listRussianFilmDirectors = visited # Visited is the order of the ids

    numLinks = defaultdict(int) #Dictionary of numLinks of each link we find
    pageLinks = defaultdict(list) #Dictionary of the links of every page
    pageRanks = defaultdict(float) #Dictionary of the page rank of every page
    idBirth = defaultdict(str) #Dictionary of the birth year of every page
    group = defaultdict(str) # Dictionary of each grouping of the pagerank
    pageRanksNoLow = defaultdict(float) # Page ranks with low values removed

    # Parse each page for links and birth dates
    regexLink='\[\[(.+?)\]\]' # get all matches between [[ ]] this is dump link format
    regexBirth='\{\{Birth date(.+?)\}\}' # birth_date = {{Birth date|df=yes|1932|4|4}}
    regexBirthDate='birth_date = \s*([^\|]*)' # | birth_date = 22 January 1898 |
    regexBirthYear='[\d]{4}'# 22 January 1898

    for idx, directors in enumerate(listRussianFilmDirectors):
        internal_links = re.findall(regexLink, pages[directors]) # gets all of the links in a page
        internal_links = [link.split('|',1)[0] for link in internal_links] # Gets rid of the name of the link, only keeps the actual link
        for link in internal_links:
            numLinks[link] += 1
            pageLinks[directors].append(link)

        # Parse birth date
        birth_date = re.findall(regexBirth, pages[directors])
        birth_date_2 = re.findall(regexBirthDate, pages[directors])

        if birth_date:
            birth_date = birth_date[0];
            birth_date = birth_date.split('|')
            for split in birth_date:
                if len(split) == 4 and split.isdigit():
                    idBirth[directors] = split
                    listRussianFilmDirectorsNoBirth.append(directors)
        elif birth_date_2:
            birth_date_2 = birth_date_2[0]
            birth_year = re.findall(regexBirthYear, birth_date_2)
            if birth_year:
                idBirth[directors] = birth_year[0]
                listRussianFilmDirectorsNoBirth.append(directors)
            else:
                if directors in pageLinks:
                    pageLinks.pop(directors)
        else:
            if directors in pageLinks:
                pageLinks.pop(directors)

    # Initiatize all pageRanks to 1
    for (idx, directors) in enumerate(listRussianFilmDirectorsNoBirth):
        pageRanks[directors] = 1.0;

    # # PageRank of A = 0.15 + 0.85 * 1/numLinks
    # # Iteration one
    for (idx, directors) in enumerate(listRussianFilmDirectors):
        for link in pageLinks[directors]: # Get list of all links for one page
            pageRanks[directors] += 0.85 * 1.0/numLinks[link];
        pageRanks[directors] += 0.15
        if pageRanks[directors] <= 1.15:
            continue
        elif pageRanks[directors] >= 30:
            group[directors] = "high"
            pageRanksNoLow[directors] = pageRanks[directors]
        elif pageRanks[directors] >= 15:
            group[directors] = "medium"
            pageRanksNoLow[directors] = pageRanks[directors]
        else:
            group[directors] = "low"
            pageRanksNoLow[directors] = pageRanks[directors]

    # Write out data to csv
    f = open('../data/pageRanksTest.csv','w')
    writer = csv.writer(f)
    labels = ["title","pagerank","year","group","id"]
    writer.writerow(labels)
    for key, value in pageRanksNoLow.items():
        if "Category:" not in pageToTitle[key]:
            writer.writerow([pageToTitle[key].encode('utf-8').strip(), value, idBirth[key], group[key], key])
    f.close()

def main():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]),
        formatter_class=argparse.RawDescriptionHelpFormatter,
                                     description=__doc__)
    parser.add_argument("input",
                        help="XML wiki dump file")
    parser.add_argument("data", help="List of page Ids")

    args = parser.parse_args()

    page_rank(args.input, args.data)

if __name__ == '__main__':
    main()
