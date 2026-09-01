#!/bin/bash

curl -X POST "http://127.0.0.1:8000/datasets" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data.csv"

read -p "Presiona para terminar prueba"