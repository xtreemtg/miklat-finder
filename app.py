from flask import Flask, render_template
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000, host="0.0.0.0")
