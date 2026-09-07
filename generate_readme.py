import json
from pathlib import Path


ROOT = Path(__file__).parent
DATA_FILE = ROOT / "data" / "toilets.json"
TEMPLATE_FILE = ROOT / "README.template.md"
README_FILE = ROOT / "README.md"


def load_toilets():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def generate_toilet_markdown(toilets):
    rank_emoji = {
        1: "🥇",
        2: "🥈",
        3: "🥉"
    }

    sections = []

    for toilet in toilets:
        rank = toilet.get("rank")

        if rank in rank_emoji:
            emoji = rank_emoji[rank]
        else:
            emoji = "⭐"

        name = toilet["name"]["zh"]
        designer = toilet.get("designer")
        designer_en = toilet.get("designer_en")
        description = toilet.get("description", "")
        google_maps = toilet.get("google_maps")

        lines = []

        lines.append(f"### {emoji} {name}")
        lines.append("")

        if designer:
            if designer_en:
                lines.append(f"**{designer}｜{designer_en}**")
            else:
                lines.append(f"**{designer}**")

            lines.append("")

        if description:
            lines.append(description)
            lines.append("")

        if google_maps:
            lines.append(f"📍 [Google Maps]({google_maps})")
            lines.append("")

        tags = toilet.get("tags", [])

        if tags:
            tag_text = " ".join(f"`{tag}`" for tag in tags)
            lines.append(tag_text)
            lines.append("")

        lines.append("---")
        lines.append("")

        sections.append("\n".join(lines))

    return "\n".join(sections)


def main():
    toilets = load_toilets()

    toilets.sort(
        key=lambda toilet: (
            toilet.get("rank") is None,
            toilet.get("rank") or 999
        )
    )

    toilet_markdown = generate_toilet_markdown(toilets)

    with open(TEMPLATE_FILE, "r", encoding="utf-8") as file:
        template = file.read()

    readme = template.replace(
        "<!-- TOILETS -->",
        toilet_markdown
    )

    with open(README_FILE, "w", encoding="utf-8") as file:
        file.write(readme)

    print(f"README.md 已生成，共 {len(toilets)} 个厕所。")


if __name__ == "__main__":
    main()