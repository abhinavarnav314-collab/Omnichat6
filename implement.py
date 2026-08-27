import os

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

# 1. Message Actions (Copy, Edit, Delete, Regenerate, Pin) in MessageList
# 9. Message Reactions
# Update MessageList.tsx
msg_list = read_file('src/components/Chat/MessageList.tsx')
# Need to add the actions bar. 
# ... too complex to write purely in string replacement. Let's do it simply.

