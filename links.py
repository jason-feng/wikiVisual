import re
import extractPage
from collections import defaultdict

#  File names
wikiDump = '/Users/jasonfeng/Downloads/enwiki-20150515-pages-articles.xml'
directorsFile = 'listRussianFilmDirectors'
textFile = 'listTest'

# Save pageIds into list
listRussianFilmDirectors = [pageId.rstrip('\n') for pageId in open(textFile)]
listRussianFilmDirectors = sorted(listRussianFilmDirectors, key=int)
pages = extractPage.process_data(wikiDump,listRussianFilmDirectors)

print 'finished extracting pages'

print pages[1]
print 'finished'
#
# d = defaultdict(int) #Dictionary of frequenices of each link
#
# regex='\[\[(.+?)\]\]' # get all matches between [[ ]] this is dump link format
# internal_links = re.findall(regex, open('676.txt').read())
#
# # Gets rid of the name of the link, only keeps the actual link
# # Creates a dictionary of the links
# for idx, link in enumerate(internal_links):
#     internal_links[idx] = link.split('|',1)[0]
#     d[internal_links[idx]] +=1
#
# print d
#
# print listRussianFilmDirectors
