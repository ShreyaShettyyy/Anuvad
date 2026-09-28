import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np


try:
    data_dict = pickle.load(open('./data.pickle', 'rb'))
except FileNotFoundError:
    print("Error: 'data.pickle' not found. Please run create_dataset.py first!")
    exit()


data = np.asarray(data_dict['data'])
labels = np.asarray(data_dict['labels'])


x_train, x_test, y_train, y_test = train_test_split(
    data, labels, test_size=0.2, shuffle=True, stratify=labels
)


model = RandomForestClassifier()
model.fit(x_train, y_train)


y_predict = model.predict(x_test)
score = accuracy_score(y_predict, y_test)

print(f'{score * 100}% of samples were classified correctly!')


f = open('model.p', 'wb')
pickle.dump({'model': model}, f)
f.close()
print("Success: model.p has been created!")

# Export compact JSON dataset for browser k-NN
import json

try:
    with open('labels.json', 'r') as f:
        labels_dict = json.load(f)
except FileNotFoundError:
    print("Error: 'labels.json' not found!")
    labels_dict = {}

grouped_data = {}
for feat, lbl in zip(data_dict['data'], data_dict['labels']):
    char_label = labels_dict.get(str(lbl), str(lbl))
    if char_label not in grouped_data:
        grouped_data[char_label] = []
    grouped_data[char_label].append(feat)

compact_dataset = []
for label, feats in grouped_data.items():
    n_samples = len(feats)
    step = max(1, n_samples // 100)
    subsample = feats[::step][:100]
    for feat in subsample:
        compact_dataset.append({
            'label': label,
            'features': [round(x, 4) for x in feat]
        })

with open('pretrained_dataset.json', 'w') as f_json:
    json.dump(compact_dataset, f_json)
print("Success: pretrained_dataset.json has been created for the web dashboard!")