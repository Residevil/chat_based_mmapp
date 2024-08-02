import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

def generate_mind_map(text):
    tokens = word_tokenize(text)
    tagged = pos_tag(tokens)
    
    mind_map = {
        'root': text[:50],  # Use first 50 characters as root
        'children': []
    }
    
    current_branch = None
    for word, tag in tagged:
        if tag.startswith('NN'):  # Noun
            if current_branch:
                mind_map['children'].append(current_branch)
            current_branch = {'text': word, 'children': []}
        elif tag.startswith('VB') or tag.startswith('JJ'):  # Verb or Adjective
            if current_branch:
                current_branch['children'].append({'text': word})
    
    if current_branch:
        mind_map['children'].append(current_branch)
    
    return mind_map

def update_mind_map(mind_map, changes):
    # This is a placeholder function. You'll need to implement the actual update logic
    # based on the structure of your 'changes' object
    if 'updatedNode' in changes:
        update_node(mind_map, changes['updatedNode'])
    return mind_map

def update_node(node, updated_node):
    if node['name'] == updated_node['id']:
        node['name'] = updated_node['name']
    else:
        for child in node.get('children', []):
            update_node(child, updated_node)



