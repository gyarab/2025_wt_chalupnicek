#!./venv/bin/python3

# For each item in repo_list.txt download referat.md file as ./referaty/docs/[referat title].md

# import httpx
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

PATH_PREFIX = "../../2025_wt/"
FILENAME = "README.md"

with open("repo_list.txt") as file:
    for repo_name in file.readlines():
        repo_name = repo_name.strip()
        if repo_name.startswith('#'):
            continue
        if not repo_name:
            continue
        print(f"{repo_name}")


        # get_file(repo_name, base_url + "README.md", "computer_pioneers")
        # get_file(repo_name, base_url + "color.md", "brands")
        # def get_file(repo_name, url, target_dir):


        # base_url = f"https://raw.githubusercontent.com/gyarab/{repo_name}/refs/heads/main/"
        # url = base_url + "README.md"
        # response = httpx.get(url)
        # text = response.text

        base_path = f"{PATH_PREFIX}{repo_name}/{FILENAME}"
        try:
            with open(base_path, "r", encoding='utf-8') as in_file:
                text = in_file.read()
        except FileNotFoundError:
            text = f"Repository not found: {repo_name}"

        subject = f"no_h1_{repo_name}"
        # try to find subject in markdown headline
        text_lines = text.split('\n')
        for line in text_lines:
            if line.startswith("# "):
                subject = line[1:].strip()[:30]
                break

        # prepend link to original repo
        text = f"from <https://github.com/gyarab/{repo_name}>\n\n{text}"

        out_file_name = subject.replace(' ', '_')
        out_file_name = re.sub('[^a-zA-Z0-9_-]+', '', out_file_name)
        out_file_name += ".md"

        print(f" - {out_file_name}         {subject}")

        target_dir = "computer_pioneers"
        with open(f"docs/{target_dir}/{out_file_name}", "w", encoding='utf-8') as out_file:
            out_file.write(text)
