import pandas as pd
from fastapi import UploadFile
from src.exceptions import *


class Dataset():
    def __init__(self, upload_file: UploadFile):
        filename = upload_file.filename
        
        if filename.endswith(".csv"):
            self.__data_frame__ = pd.read_csv(upload_file.file)
        elif filename.endswith(".xlsx"):
            self.__data_frame__ = pd.read_excel(upload_file.file)
        else:
            raise FormatoInvalido("Format not supported...")
        
    def json(self):
        return self.__data_frame__.to_json(orient="records", lines=True)
    
    def str(self):
        return self.__data_frame__.to_string()
    
    def dict(self):
        return self.__data_frame__.to_dict(orient="records")
    
    def df(self):
        return self.__data_frame__
