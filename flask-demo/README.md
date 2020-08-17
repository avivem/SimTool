## README

### Set up local environment

1. Virtual Environment

	on mac
	python3 -m venv .venv

	on windows
	py -3 -m venv .venv

2. Activate the Environment

	on mac
	. venv/bin/activate

	on windows
	> .venv\Scripts\activate

3. Download Dependencies

	pip install -r requirements.txt

4. Run the API
	Linx/Mac
	export FLASK_APP=hello.py
	flask run

	windows
	$env:FLASK_ENV="development"
	flask run

This is a simple API to connect to our front-end React user interface
