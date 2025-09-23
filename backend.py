import openai
import requests
import pyttsx3
import textwrap

# ---------------- SETTINGS ----------------
openai.api_key = "OPENAI_API_KEY"
NEWS_API_KEY = "YOUR_NEWSAPI_KEY"   # get from https://newsapi.org/

def fetch_news(interests, articles_per_topic=2):
    """
    Fetch live news headlines from NewsAPI for each interest.
    """
    all_news = {}
    url = "https://newsapi.org/v2/everything"
    
    for topic in interests:
        params = {
            "q": topic,
            "language": "en",
            "pageSize": articles_per_topic,
            "sortBy": "publishedAt",
            "apiKey": NEWS_API_KEY
        }
        r = requests.get(url, params=params)
        data = r.json()
        if "articles" in data and data["articles"]:
            headlines = [a["title"] + " - " + (a.get("description") or "") 
                         for a in data["articles"]]
            all_news[topic] = headlines
        else:
            all_news[topic] = ["No live news found."]
    return all_news

def summarize_news(travel_time, interests, news_data):
    """
    Use GPT to summarize the live news into a podcast script.
    """
    formatted_news = "\n\n".join(
        [f"{topic}:\n" + "\n".join(news) for topic, news in news_data.items()]
    )

    prompt = f"""
    Create a podcast script that lasts about {travel_time} minutes. 
    Make it conversational, engaging, and easy to listen to.
    Cover these interests: {', '.join(interests)}.

    Summarize and explain the following live news headlines:
    {formatted_news}

    Start with a brief welcome, then go through each topic naturally, 
    and end with a short sign-off.
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response["choices"][0]["message"]["content"]

def generate_audio(text, filename="commute_podcast.mp3"):
    """
    Convert text into speech and save as an mp3.
    """
    engine = pyttsx3.init()
    engine.save_to_file(text, filename)
    engine.runAndWait()
    print(f"\n✅ Podcast saved as {filename}")

# ---------------- MAIN ----------------
if __name__ == "__main__":
    travel_time = input("Enter your commute time in minutes: ")
    interests = []
    print("Enter 5 of your interests:")
    for i in range(5):
        interests.append(input(f"Interest {i+1}: "))

    # Step 1: Fetch live news
    news_data = fetch_news(interests)

    # Step 2: Summarize into podcast script
    script = summarize_news(travel_time, interests, news_data)

    print("\n--- Podcast Script Preview ---\n")
    print(textwrap.fill(script, width=80))

    # Step 3: Convert to audio file
    generate_audio(script, "commute_podcast.mp3")

