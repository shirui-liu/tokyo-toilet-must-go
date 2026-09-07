import json
from pathlib import Path


ROOT = Path(__file__).parent
DATA_FILE = ROOT / "data" / "toilets.json"

LANGUAGES = {
    "zh": {
        "template": ROOT / "README.template.md",
        "output": ROOT / "README.md",
        "map_text": "📍 [Google Maps]"
    },
    "ja": {
        "template": ROOT / "README.ja.template.md",
        "output": ROOT / "README.ja.md",
        "map_text": "📍 [Google Maps]"
    },
    "en": {
        "template": ROOT / "README.en.template.md",
        "output": ROOT / "README.en.md",
        "map_text": "📍 [Google Maps]"
    }
}


def load_toilets():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def sort_toilets(toilets):
    return sorted(
        toilets,
        key=lambda toilet: (
            toilet.get("rank") is None,
            toilet.get("rank") or 999
        )
    )


def generate_toilet_markdown(toilets, language):
    rank_emoji = {
        1: "🥇",
        2: "🥈",
        3: "🥉"
    }

    sections = []

    for toilet in toilets:
        rank = toilet.get("rank")
        emoji = rank_emoji.get(rank, "⭐")

        name = toilet["name"].get(language, "")
        designer = toilet.get("designer")
        designer_en = toilet.get("designer_en")
        description = toilet.get("description", {}).get(language, "")
        google_maps = toilet.get("google_maps")

        address = toilet.get("address", {}).get(language, "")
        tags = toilet.get("tags", {}).get(language, [])

        lines = []

        lines.append(f"### {emoji} {name}")
        lines.append("")

        if designer:
            if designer_en:
                lines.append(f"**{designer}｜{designer_en}**")
            else:
                lines.append(f"**{designer}**")

            lines.append("")

        if address:
            lines.append(f"📍 {address}")
            lines.append("")

        if description:
            lines.append(description)
            lines.append("")

        if google_maps:
            lines.append(
                f"🗺️ [Google Maps]({google_maps})"
            )
            lines.append("")

        if tags:
            tag_text = " ".join(
                f"`{tag}`" for tag in tags
            )
            lines.append(tag_text)
            lines.append("")

        lines.append("---")
        lines.append("")

        sections.append("\n".join(lines))

    return "\n".join(sections)


def generate_readme(toilets, language):
    config = LANGUAGES[language]

    with open(config["template"], "r", encoding="utf-8") as file:
        template = file.read()

    toilet_markdown = generate_toilet_markdown(
        toilets,
        language
    )

    readme = template.replace(
        "<!-- TOILETS -->",
        toilet_markdown
    )

    with open(config["output"], "w", encoding="utf-8") as file:
        file.write(readme)


def main():
    toilets = load_toilets()
    toilets = sort_toilets(toilets)

    for language in LANGUAGES:
        generate_readme(toilets, language)

    print(
        f"README generated successfully: "
        f"{len(toilets)} toilets × {len(LANGUAGES)} languages"
    )


if __name__ == "__main__":
    main()