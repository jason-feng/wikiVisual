import re
from collections import defaultdict

d = defaultdict(int) #Dictionary of frequenices of each link

regex='\[\[(.+?)\]\]' # get all matches between [[ ]] this is dump link format
internal_links = re.findall(regex, open('676.txt').read())

# Gets rid of the name of the link, only keeps the actual link
# Creates a dictionary of the links
for idx, link in enumerate(internal_links):
    internal_links[idx] = link.split('|',1)[0]
    d[internal_links[idx]] +=1

print d
