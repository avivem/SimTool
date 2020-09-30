## SimTool Engine
SimTool Engine is the backend for the SimTool project and is written in Python using Flask and SimPy.
Documentation has yet to be written, but most functions are self-explanatory and/or are well commented.

### Set up local environment

1. Virtual Environment

	Linx/Mac
	> python3 -m venv .venv

	on windows
	> py -3 -m venv \.venv

2. Activate the Environment

	Linx/Mac
	> . .venv/bin/activate

	on windows
	> .venv\Scripts\activate

3. Download Dependencies

	> pip install -r requirements.txt

4. Run the API

	Linx/Mac
	> export FLASK_APP=hello.py
	> flask run

	windows
	> $env:FLASK_ENV="development"
	> flask run
