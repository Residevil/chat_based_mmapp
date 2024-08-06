import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
from nltk.corpus import stopwords
from collections import defaultdict
import logging
import itertools

nltk.download('punkt', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('maxent_ne_chunker', quiet=True)
nltk.download('words', quiet=True)
nltk.download('stopwords', quiet=True)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def generate_mind_map(text):

    # return {
    #     "name": "Test Mind Map",
    #     "attributes": {
    #         "note": text[:100]
    #     },
    #     "children": []
    # }

    try:
        logger.debug(f"Generating mind map for text: {text}")
        if isinstance(text, list):
            text = ' '.join(text)
        elif not isinstance(text, str):
            text = str(text)
        
        sentences = sent_tokenize(text)
        stop_words = set(stopwords.words('english'))

        # Initialize main topic as the first sentence or first 50 characters
        main_topic = sentences[0][:50] if sentences else text[:50]

        mind_map = {
            "name": main_topic,
            "attribute": {
                "note": text[:100] + "..." if len(text) > 100 else text
            },
            # "root": text[:50],  # Use first 50 characters as root
            "children": []
        }

        # Extract key concepts and their relationships
        topics, co_occurrences = extract_key_concepts(sentences, stop_words)

        # Create main branches
        main_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)[:5]
        for main_topic, importance in main_topics:
            branch = create_branch(main_topic, importance)
            add_related_topics(branch, main_topic, topics, co_occurrences)
            mind_map["children"].append(branch)

        logger.debug("Mind map generated successfully")
        return mind_map

    except Exception as e:
        logger.error(f"Error in generate_mind_map: {str(e)}")
        raise

def extract_key_concepts(sentences, stop_words):
    topics = defaultdict(int)
    co_occurrences = defaultdict(int)

    for sentence in sentences:
        tokens = word_tokenize(sentence)
        tagged = pos_tag(tokens)
        named_entities = ne_chunk(tagged)

        sentence_topics = []

        for chunk in named_entities:
            if isinstance(chunk, nltk.Tree):
                entity = " ".join([c[0] for c in chunk.leaves()])
                if entity.lower() not in stop_words:
                    topics[entity] += 3
                    sentence_topics.append(entity)
            elif chunk[1].startswith('NN') and chunk[0].lower() not in stop_words:
                topics[chunk[0]] += 2
                sentence_topics.append(chunk[0])

        for topic1, topic2 in itertools.combinations(sentence_topics, 2):
            co_occurrences[(topic1, topic2)] += 1
            co_occurrences[(topic2, topic1)] += 1

    return topics, co_occurrences

def create_branch(topic, importance):
    return {
        "name": topic,
        "attributes": {
            "note": f"Importance: {importance}",
            "importance": importance
        },
        "children": []
    }

def add_related_topics(branch, main_topic, topics, co_occurrences):
    related_topics = [
        (other_topic, co_occurrences[(main_topic, other_topic)])
        for other_topic in topics.keys()
        if other_topic != main_topic
    ]
    related_topics.sort(key=lambda x: x[1], reverse=True)

    for sub_topic, relevance in related_topics[:3]:
        sub_branch = create_branch(sub_topic, relevance)
        branch["children"].append(sub_branch)

def update_mind_map(mind_map, changes):
    if 'updatedNode' in changes:
        def update_node(node):
            if node['name'] == changes['updatedNode']['name']:
                return {**node, **changes['updatedNode']}
            if 'children' in node:
                return {**node, 'children': [update_node(child) for child in node['children']]}
            return node
        
        return update_node(mind_map)
    elif 'updatedMap' in changes:
        return changes['updatedMap']
    return mind_map

    # # Helper function to add a node to the mind map
    # def add_node(parent, name, note="", importance=0):
    #     node = {"name": name, "attributes": {"note": note, "importance": importance}, "children": []}
    #     parent["children"].append(node)
    #     return node


    
        # logger.debug(f"Generating mind map for text: {text}")

        # Initialize dictionaries for different POS categories
        # Analyze text and extract key concepts
#         topics, co_occurrences = defaultdict(int), defaultdict(int)
#         pos_categories = {
#             'NN': 'Nouns', 'VB': 'Verbs', 'JJ': 'Adjectives', 
#             'RB': 'Adverbs', 'IN': 'Prepositions', 'CC': 'Conjunctions',
#             'PRP': 'Pronouns', 'DT': 'Determiners', 'CD': 'Numerals' 
#         }

#         for i, sentence in enumerate(sentences):
#             logger.debug(f"Processing sentence {i+1}: {sentence}")
#             tokens = word_tokenize(sentence)
#             tagged = pos_tag(tokens)
#             named_entities = ne_chunk(tagged)

#             sentence_topics = []

#             for chunk in named_entities:
#                 if isinstance(chunk, nltk.Tree):
#                     # Named Entity (Proper Nouns)
#                     entity = " ".join([c[0] for c in chunk.leaves()])
#                     if entity.lower() not in stop_words:
#                         topics[entity] += 3  # Give more weight to named entities
#                         sentence_topics.append(entity)
#                 elif chunk[1].startswith('NN') and chunk[0].lower() not in stop_words:
#                     # Noun
#                     topics[chunk[0]] += 2
#                     sentence_topics.append(chunk[0])
#                 elif chunk[1].startswith('VB') and chunk[0].lower() not in stop_words:
#                     # Verb
#                     continue
            
#             # update co-occurrences
#             for topic1, topics2 in itertools.combinations(sentence_topics, 2):
#                 co_occurrences [(topic1, topics2)] += 1
                                                          
#         # Sort concepts by importance
#         sorted_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)

#         # Create main branches
#         main_topics = sorted_topics[:5]  # Top 5 topics become main branches
#         for main_topic, importance in main_topics:
#             branch = add_node(mind_map, main_topic, importance=importance)

#             # Find related sub-topics
#             related_topics = [
#                 (other_topic, co_occurrences[(main_topic, other_topic)] + co_occurrences[(other_topic, main_topic)])
#                 for other_topic in topics.keys()
#                 if other_topic != main_topic
#             ]
#             # sort related topics based on importance
#             related_topics.sort(key=lambda x: x[1], reverse=True)

#             # Add sub-topics as child nodes
#             for sub_topic, relevance in related_topics[:3]:
#                 add_node(branch, sub_topic, importance=relevance)

#             # # Find related words for each main concept
#             # related_words = defaultdict(int)
#             # for sentence in sentences:
#             #     if concept.lower() in sentence.lower():
#             #         words = word_tokenize(sentence)
#             #         tagged = pos_tag(words)
#             #         for word, tag in tagged:
#             #             if word.lower() not in stop_words and word.lower() != concept.lower():
#             #                 if tag.startswith('NN'):
#             #                     related_words[word] += 2
#             #                 elif tag.startswith('VB') or tag.startswith('JJ'):
#             #                     related_words[word] += 1

#             # # Add related words as subnodes
#             # for word, count in sorted(related_words.items(), key=lambda x: x[1], reverse=True)[:3]:
#             #     add_node(branch, word, pos=pos_tag([word])[0][1])
#             # sentence_node = {
#             #     "name": f"Idea {i+1}",
#             #     "attribute": {
#             #         "note": sentence
#             #     },
#             #     "children": []
#             # }
#             # current_branch = None
#             # for word, tag in tagged:
#             #     if tag.startswith('NN'):  # Noun
#             #         if current_branch:
#             #             sentence_node['children'].append(current_branch)
#             #         current_branch = {
#             #             "name": word,
#             #             "attributes": {"note": f"Noun: {word}"},
#             #             "children": []
#             #         }            
#             #     elif tag.startswith('VB') or tag.startswith('JJ'):  # Verb
#             #         if current_branch:
#             #             current_branch['children'].append({
#             #                 "name": word,
#             #                 "attributes": {"note": f"Verb: {word}"}
#             #             })        
#             #     elif tag.startswith('JJ'):  # Adjective
#             #         if current_branch:
#             #             current_branch['children'].append({
#             #                 "name": word,
#             #                 "attributes": {"note": f"Adjective: {word}"}
#             #             })        
#             # if current_branch:
#             #     sentence_node['children'].append(current_branch)
            
#             # mind_map['children'].append(sentence_node)
        



# def update_mind_map(mind_map, changes):
#     if 'updatedNode' in changes:
#         def update_node(node):
#             if node['name'] == changes['updatedNode']['name']:
#                 return {**node, **changes['updatedNode']}
#             if 'children' in node:
#                 return {**node, 'children': [update_node(child) for child in node['children']]}
#             return node
        
#         return update_node(mind_map)
#     elif 'updatedMap' in changes:
#         return changes['updatedMap']
#     return mind_map