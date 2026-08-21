import pandas as pd
import os

class DataFrame():
    def __init__(self, path):
        self.data_frame = pd.read_csv(path)
        
    def json(self):
        return self.data_frame.to_json(orient="records", lines=True)[1:-1].replace("},{", "} {")
    
    def str(self):
        return self.data_frame.to_string()
    
    def dict(self):
        return self.data_frame.to_dict(orient="records")
