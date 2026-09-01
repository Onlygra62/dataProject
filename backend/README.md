# BACKEND DE LA APP HECHO CON  FASTAPI

Para correr el backend se necesita **uv** 

- Descargar **uv**

- Una vez instalado *uv* escribir en la terminal desde este directorio 
```bash
    uv run fastapi dev
```

El backend recibe archivos ```.csv``` y archivos ```.xlsx```.

Para subir un archivo puedes ejecutar el archivo ```src\tests\ingest.sh``` usando Git Bash o usar el comando directamente en la consola de Git Bash:
```bash
curl -X POST "http://127.0.0.1:8000/datasets" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "file=@data.csv"
```

*El archivo ```"file=@```**data.csv**```"``` tiene que estar en el directorio donde ejecutaste el comando*

El comando te regresara este formulario:
- ```UUID```: La id del dataset
- ```dataframe```: La información del archivo ahora convertida en un dataframe
- ```preview```: Una pagina donde puedes ver **parte** de la información del archivo
- ```full```: Una pagina donde puedes ver **toda** la información del archivo, preferiblemente usada para el metodo GET.