import re
import extractPage
import wikipedia
from collections import defaultdict
import json

# List of PageIds of all the directors
testFile = 'listTest'
directorsFile = 'listRussianFilmDirectors'
listRussianFilmDirectors = [pageId.rstrip('\n') for pageId in open(directorsFile)]
listRussianFilmDirectors = sorted(listRussianFilmDirectors, key=int)
input_file = '/Users/jasonfeng/Downloads/page_out_link_counts_en.nt'

# Format of the file
# <http://dbpedia.org/resource/Yevgeni_Bauer> <http://dbpedia.org/ontology/wikiPageOutLinkCount> "47"^^<http://www.w3.org/2001/XMLSchema#integer> .
#
# pageName = '.*resource\/(.*?)\>.*' # Gets the name of the page
# linkCount = '.*\"(.*)\"' # Gets the number of out links
#
# pageTitles = defaultdict(str) # The title of each pageId
# pageTitlesLinkCount = defaultdict(float) # Num links of each title
# pageRanks = defaultdict(float)
#
# for director in listRussianFilmDirectors:
#     pageTitles[director] = wikipedia.page(pageid=director).title.replace (" ", "_")
#     print pageTitles[director]
#
# input = open(input_file)
# for line in input:
#     m = re.search(pageName,line)
#     if m.group(1) in pageTitles.values():
#         pageTitlesLinkCount[m.group(1)] = float(re.search(linkCount,line).group(1))
#
# input.close()
#
# print pageTitlesLinkCount
#
# for (idx, directors) in enumerate(listRussianFilmDirectors):
#     pageRanks[directors] = 1.0;
# #
# # # PageRank of A = 0.15 + 0.85 * PR(B)
# # # Iteration one
# for (idx, directors) in enumerate(listRussianFilmDirectors):
#     if pageTitlesLinkCount[pageTitles[directors]] != 0:
#         pageRanks[pageTitles[directors]] = 0.15 + 0.85 * 1.0/pageTitlesLinkCount[pageTitles[directors]];
#
# print pageRanks
#
# json = json.dumps([{'name': k, 'size': v} for k,v in pageRanks.items()], indent=4)
# f = open('pageLinks.json', 'w')
# print >> f, json

print wikipedia.page(pageid=14671984)
