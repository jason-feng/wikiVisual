import re
import extractPage
import json
import csv
from collections import defaultdict

#  File names
wikiDump = '/Users/jasonfeng/Downloads/enwiki-20150515-pages-articles.xml'
directorsFile = '../data/listRussianSovietFilmDirectors'
testFile = '../data/listTest'

# Save pageIds into list
listRussianFilmDirectors = [pageId.rstrip('\n') for pageId in open(directorsFile)]
listRussianFilmDirectors = sorted(listRussianFilmDirectors, key=int)

pages, pageToTitle = extractPage.process_data(wikiDump,listRussianFilmDirectors)

numLinks = defaultdict(int) #Dictionary of numLinks of each link we find
pageLinks = defaultdict(list)
pageRanks = defaultdict(float)
idBirth = defaultdict(str)
titlePageRanks = defaultdict(float)


regexLink='\[\[(.+?)\]\]' # get all matches between [[ ]] this is dump link format
regexBirth='\{\{Birth date(.+?)\}\}' # birth_date = {{Birth date|df=yes|1932|4|4}}
for idx, directors in enumerate(listRussianFilmDirectors):
    internal_links = re.findall(regexLink, pages[idx]) # gets all of the links in a page
    internal_links = [link.split('|',1)[0] for link in internal_links] # Gets rid of the name of the link, only keeps the actual link
    for link in internal_links:
        numLinks[link] += 1
        pageLinks[directors].append(link)
    birth_date = re.findall(regexBirth, pages[idx])[0]
    birth_date = birth_date.split('|')
    birth_year = birth_date[2]
    idBirth[directors] = birth_year

print idBirth

# Initiatize all pageRanks to 1
for (idx, directors) in enumerate(listRussianFilmDirectors):
    pageRanks[directors] = 1.0;
#
# # PageRank of A = 0.15 + 0.85 * 1/numLinks
# # Iteration one
for (idx, directors) in enumerate(listRussianFilmDirectors):
    for link in pageLinks[directors]: # Get list of all links for one page
        pageRanks[directors] += 0.85 * 1.0/numLinks[link];
    pageRanks[directors] += 0.15

print pageRanks

# Associate each article title with the pageRank
for directors in listRussianFilmDirectors:
    titlePageRanks[pageToTitle[directors]] = pageRanks[directors]

print titlePageRanks

# Write out data to csv
f = open('../csv/pageRanks.csv','wb')
writer = csv.writer(f)
csv = ["name","value"]
writer.writerow(csv)
for key, value in pageRanks.items():
   writer.writerow([pageToTitle[key], value, idBirth[key], key])
f.close()
#
# d = {"name":"Russian Film Directors",
#      "children":[{'name':key,"size":value} for key,value in titlePageRanks.items()]}
# j = json.dumps(d, indent=4)
# f = open('../json/pageRanks.json', 'w')
# print >> f, j
# f.close()
