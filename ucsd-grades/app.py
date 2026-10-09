import pandas as pd
import streamlit as st

from data import filter_offerings, load_offerings, parse_term_sort_key, summarize

st.set_page_config(page_title="UCSD Grade Distributions", layout="wide")


@st.cache_data(ttl=3600, show_spinner="Loading grade sheet...")
def cached_offerings() -> list[dict]:
    return load_offerings()


def term_options(offerings: list[dict]) -> list[str]:
    return sorted({row["term"] for row in offerings}, key=parse_term_sort_key, reverse=True)


offerings = cached_offerings()

st.title("UCSD grade distributions")
st.caption("Crowdsourced Cape-style reports from the public Google Sheet. GPA is enrollment-weighted when counts exist.")

with st.sidebar:
    st.header("Search")
    course_q = st.text_input("Course", placeholder="CSE, AAS 10, MATH 20C")
    prof_q = st.text_input("Professor", placeholder="Last name or first name")
    terms = st.multiselect("Term", options=term_options(offerings))
    if st.button("Reload sheet"):
        cached_offerings.clear()
        st.rerun()

rows = filter_offerings(offerings, course_q, prof_q, terms)
stats = summarize(rows)

c1, c2, c3, c4 = st.columns(4)
c1.metric("Offerings", f"{stats['offerings']:,}")
c2.metric("Courses", f"{stats['courses']:,}")
c3.metric("Avg GPA", f"{stats['avg_gpa']:.2f}" if stats["avg_gpa"] is not None else "n/a")
c4.metric("Enrollment", f"{stats['enrollment']:,}" if stats["enrollment"] is not None else "n/a")

if stats["grade_totals"]:
    st.subheader("Grade breakdown")
    grade_df = pd.DataFrame(stats["grade_totals"]).set_index("grade")
    st.bar_chart(grade_df)
    st.dataframe(grade_df.rename(columns={"count": "students"}), use_container_width=True)

st.subheader("Offerings")
if not rows:
    st.info("No rows match those filters.")
else:
    newest_first = list(reversed(rows))
    table = pd.DataFrame([
        {
            "Term": row["term"],
            "Course": row["course"],
            "Professor": row["professor"],
            "GPA": row["gpa"],
            "Enrollment": row["enrollment"],
            "A / A-": (row["grades"].get("A+", 0) + row["grades"].get("A", 0) + row["grades"].get("A-", 0)) or None,
            "B band": (row["grades"].get("B+", 0) + row["grades"].get("B", 0) + row["grades"].get("B-", 0)) or None,
            "C or below": (
                row["grades"].get("C+", 0)
                + row["grades"].get("C", 0)
                + row["grades"].get("C-", 0)
                + row["grades"].get("D", 0)
                + row["grades"].get("F", 0)
            ) or None,
            "Notes": "; ".join(row["notes"]),
        }
        for row in newest_first
    ])
    st.dataframe(table, use_container_width=True, hide_index=True, height=560)

    picked = st.selectbox(
        "Grade detail",
        options=list(range(len(newest_first))),
        format_func=lambda i: f"{newest_first[i]['term']}  {newest_first[i]['course']}  {newest_first[i]['professor']}",
    )
    detail = newest_first[picked]
    detail_grades = [{"grade": k, "count": v} for k, v in detail["grades"].items()]
    if detail_grades:
        st.bar_chart(pd.DataFrame(detail_grades).set_index("grade"))
    elif detail["notes"]:
        st.warning(detail["notes"][0])
