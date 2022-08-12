# Gradio Flow 🤗
 
**A web application with a backend in Flask and frontend in Rect, and React Flow that use [React flow](https://reactflow.dev/) node base environment to
stream both gradio and streamlit interfaces, within a single application.**
 
 
## Tabel Of Contents 📚
 - [**App Architecture**](#app-architecture-%EF%B8%8F)
 
 - [**Prerequisites**](#prerequisites-)
 
 - [**Running The App**](#running-the-app-%EF%B8%8F)
 
   - [**Makefile Run**](#makefile-run-docker-)

    
     - [**Running the docker container**](#1-running-the-docker-container)
    
    
     - [**Entering the backend enviorment**](#2-entering-the-backend-enviorment)
    
    
     - [**Appending Nodes To Frontend From The Backend**](3-appending-nodes-to-frontend-from-the-backend)
   
   
   - [**Non-Docker Build**](#non-docker-build)
   
   
     - [**Build frontend**](#1-build-frontend-within-the-directory-frontend)
    
    
     - [**Run frontend**](#2-run-frontend-within-the-directory-frontend)
    
    
     - [**Build backend dependency**](#3-build-backend-dependency-within-the-directory-backend)
    
    
     - [**Build backend**](#4-run-backend-within-the-directory-backend)
    
    
     - [**Run Gradio within Gradio-Flow**](#5-run-gradio-within-gradio-flow)
 
 - [**Application**](#application-%EF%B8%8F)
 ## App Architecture 🏗️
![architecture](https://github.com/commune-ai/Gradio-Flow/blob/gradio-flow/gradio-only/architecture.png)
 
## Prerequisites 📝
You will need:
(Docker build 🐳 Currently Only on: Linux)
- [🐳  Docker](https://docs.docker.com/get-docker/)
- [🐋 Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop on Windows and macOS)
 
(Running Without docker)
- 🐍 Python 3.2+ (backend)
- npm 8.5.0 (frontend)
- node v16.14.2 (frontend)
## Running The App 🖥️
 
Starting up it's simple as every command is already within the Makefile.
 
### Makefile Run (Docker 🐳)
#### **1.** Running the docker container
```console
make up
// command running: docker-compose up -d --remove-orphans;
// **Ubuntu** sudo make up
```
The React application will be running on ``http://localhost:3001`` and the Flask will be running on ``http://localhost:2000``
#### **2.** Entering the backend enviorment
```console
make environment
// command running: docker exec -it backend bash;
// **Ubuntu** sudo make environment
```
Now that you're within the docker backend container environment you can start adding gradio/streamlit nodes within the frontend. (**Extra Note**) You do not need to be within the container environment to append nodes there is a feature to just run your own gradio application and then append it within the frontend by using the **+ button**. 
 
#### **3.** Appending Nodes To Frontend From The Backend

```console
> cd ./src
> python index.py
//run example gradio application
```

### Non-Docker Build

#### **1.** Build Frontend (within the directory ``./frontend``)
```console
npm install
```
#### **2.** Run Frontend (within the directory ``./frontend``)
```console
npm start
```

#### **3.** Build Backend Dependency (within the directory ``./backend``)
```console
pip install -r requirements.txt
```

#### **4.** Run Backend (within the directory backend)

```console
python app.py -p 2000
//**NOTE** -p 2000 just assignes it localhost port 2000 anyother port will not work
```
#### **5.** Run Gradio within Gradio-Flow 
It is quite simple, and similar within the docker build, the first way you can append your gradio to the Gradio flow is through running your application at a reachable url that is provided ed when you run Gradio and appending it via ``+ button`` within the frontend, another way that is possible is that within the directory ``./backend/src/helper`` there is a code that you can use to convert your own class or functional  base code into basic gradio tabular interface by using decorators, these decorators will send the nesarry information to the backend flask api and update the frontend menu state in which you'll will be able to interact with it within the front end creating a hub for gradio build functions(**read more** [**here**](https://github.com/LVivona/GradioWrapper)).

**NOTE** If you use the gradio decorator compiler for gradio flow you need to set a listen port to 2000 or else the api will never get the key and will throw you an error, I'll also provided an example below if this isn't clear.

```python
#backend/src/demo.py (functional base)
##########
from helper.compiler import functionalCompiler, tabularGradio
import gradio as gr

@functionalCompiler(inputs=[gr.Textbox(label="name")], outputs=['text'], examples=[["Luca Vivona"]])
def Hello_World(name):
        return f"Hello {name}, and welcome to Gradio Flow 🤗" 

if __name__ == "__main__":
    tabularGradio([Hello_World()], ["hello world"], listen=2000)
```

```python
#backend/src/index.py (Class Base)
###########
from helper.compiler import register, GradioCompiler
import gradio as gr

@GradioCompiler
class Greeting:

    @register(inputs=[gr.Textbox(label="name")], outputs=['text'], examples=[["Luca Vivona"]])
    def Hello_World(self, name):
        return f"Hello {name}, and welcome to Gradio Flow 🤗" 



if __name__ == "__main__":
    Greeting().run(listen=2000)
```
 
## Application 🏛️
![Application](https://github.com/commune-ai/Gradio-Flow/blob/gradio-flow/gradio-only/app.png)