import pickle
import json

try:
    with open('data.pickle', 'rb') as f:
        data_dict = pickle.load(f)
    
    with open('pretrained_dataset.json', 'r') as f:
        pretrained_data = json.load(f)
        
    labels_json = {}
    
    for i in range(len(data_dict['labels'])):
        label_id = data_dict['labels'][i]
        features = data_dict['data'][i]
        # Round features to match how they were saved in pretrained_dataset
        rounded_features = [round(x, 4) for x in features]
        
        for item in pretrained_data:
            if item['features'] == rounded_features:
                labels_json[str(label_id)] = item['label']
                break
                
    # Sort them nicely
    labels_json = dict(sorted(labels_json.items(), key=lambda item: int(item[0])))
    
    with open('labels.json', 'w') as f:
        json.dump(labels_json, f)
        
    print(f"Successfully restored labels.json with {len(labels_json)} labels!")
    print(labels_json)
except Exception as e:
    print(f"Error: {e}")
