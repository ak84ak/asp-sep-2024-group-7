import "./coursera-import-textarea.css";
import {useState} from "react";
import { parse } from "node-html-parser";
import {ICourseraParsedActivity} from "@/models/parsing/CourseraModels";

export type CourseraImportTextareaProperties = {
    onParse: (activities: ICourseraParsedActivity[], errors: string[]) => void
}

interface AnnotationsParserResult {
    rule?: string;
    type?: string;
    duration?: number;
    grade?: string;
    deadline?: string;
    submitted?: boolean | undefined;
    overdue?: boolean | undefined;
}

const annotationsParsers: {
    getRegex: () => RegExp,
    process: (match: RegExpMatchArray, result: AnnotationsParserResult) => void
}[] =
[
    // Video•. Duration:&nbsp;19 minutes19 min
    {
        getRegex: () => (/^(.+)•. Duration:&nbsp;(\d+) minute(s)?(\d+) min$/i),
        process: (match, result) => {
            result.rule = "1";
            result.type = match[1].toLowerCase();
            result.duration = parseInt(match[2]);
        }
    },
    // Ungraded App Item•. Duration:&nbsp;1 hour1h
    {
        getRegex: () => (/^(.+)•. Duration:&nbsp;(\d+) hour(s)?(\d+)h$/i),
        process: (match, result) => {
            result.rule = "2";
            result.type = match[1].toLowerCase();
            result.duration = parseInt(match[2]) * 60;
        }
    },
    // OverdueGraded Team Assignment•Started•Grade: --
    {
        getRegex: () => (/^Overdue(.+)•Started•Grade: --$/i),
        process: (match, result) => {
            result.rule = "3";
            result.type = match[1].toLowerCase();
            result.grade = "--";
            result.overdue = true;
        }
    },
    // Video•. Duration:&nbsp;1 hour 1 minute1h 1m
    {
        getRegex: () => (/^(.+)•. Duration:&nbsp;(\d+) hour(s)? (\d+) minute(s)?(\d+)h (\d+)m$/i),
        process: (match, result) => {
            result.rule = "4";
            result.type = match[1].toLowerCase();
            result.duration = parseInt(match[2]) * 60 + parseInt(match[4]);
        }
    },
    // Due, Jan 6, 4:00 PM EETGraded Assignment•Started•Grade: --
    {
        getRegex: () => (/^Due, (.+)Graded Assignment•Started•Grade: --$/i),
        process: (match, result) => {
            result.rule = "5";
            result.type = "graded assignment";
            result.deadline = match[1];
            result.grade = "--";
        }
    },
    // GradedPractice Assignment•Submitted•Grade:&nbsp;100%
    {
        getRegex: () => (/^GradedPractice Assignment•Submitted•Grade:&nbsp;([0-9]+)%$/i),
        process: (match, result) => {
            result.rule = "6";
            result.type = "graded practice assignment";
            result.grade = match[1];
            result.submitted = true;
        }
    },
    // Practice Assignment•Submitted•Grade: --
    {
        getRegex: () => (/^Practice Assignment•Submitted•Grade: --$/i),
        process: (match, result) => {
            result.rule = "7";
            result.type = "practice assignment";
            result.grade = "--";
            result.submitted = true;
        }
    },
    // Practice Quiz•2 questions
    {
        getRegex: () => (/^Practice Quiz•(\d+) questions$/i),
        process: (match, result) => {
            result.rule = "8";
            result.type = "practice quiz";
        }
    },
    // GradedQuiz•2 questions•Grade:&nbsp;100%
    {
        getRegex: () => (/^GradedQuiz•(\d+) questions•Grade:&nbsp;([0-9]+)%$/i),
        process: (match, result) => {
            result.rule = "9";
            result.type = "graded quiz";
            result.grade = match[2];
        }
    }
];

export default function CourseraImportTextarea(props: CourseraImportTextareaProperties) {
    const [content, setContent] = useState<string>("");
    const [, setParsingErrors] = useState<string[]>([]);

    const annotationsParser = (text: string) => {
        const result: AnnotationsParserResult = { }

        for (const rule of annotationsParsers) {
            const rx = rule.getRegex();
            const match = text.match(rx);
            if (match != null) {
                rule.process(match, result);
                return result;
            }
        }

        return null;
    };

    const onContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const errors = [];
        const activities: ICourseraParsedActivity[] = [];

        const rawHtml = e.currentTarget.innerHTML;

        if (rawHtml.trim() == "") {
            return;
        }

        const root = parse(rawHtml, {lowerCaseTagName: true, comment: true, parseNoneClosedTags: true});

        const lessonsGroupEls = root.querySelectorAll('.rc-ItemGroupLesson');

        if (lessonsGroupEls.length == 0) {
            console.log("No lesson groups found in root element", root);
            errors.push("No lesson groups found in root element");
            return;
        }

        for (let i = 0; i < lessonsGroupEls.length; i++) {
            const lessonGroupEl = lessonsGroupEls[i];

            const lessonEls = lessonGroupEl.querySelectorAll('ul li a .rc-WeekSingleItemDisplayRefresh');

            if (lessonEls.length == 0) {
                console.log("No lessons found in lesson group element", lessonGroupEl);
                errors.push("No lessons found in lesson group element");
                continue;
            }

            for (let j = 0; j < lessonEls.length; j++) {
                const lessonEl = lessonEls[j];

                let completed = false;

                const iconEls = lessonEl.querySelectorAll('svg');
                if (iconEls.length > 1) {
                    console.log("More than one icon found in lesson element", lessonEl, lessonGroupEl);
                    errors.push("More than one icon found in lesson element");
                }
                const iconEl = iconEls[0];
                const iconPathEls = iconEl.querySelectorAll('path');
                if (iconPathEls.length == 0) {
                    console.log("No path element found in icon element", iconEl, lessonEl);
                    errors.push("No path element found in icon element");
                } else {
                    const iconPathEl = iconPathEls[0];
                    const pathHtml = iconPathEl.outerHTML;

                    completed = pathHtml == "<path d=\"M10 1a9 9 0 100 18 9 9 0 000-18zM8.36 14.63l-4-4L5.8 9.24l2.56 2.56L14.2 6l1.42 1.42-7.26 7.21z\" fill=\"currentColor\"></path>"
                        || pathHtml == "<path d=\"M8.938 10.875l-1.25-1.23a.718.718 0 00-.521-.228.718.718 0 00-.521.229.73.73 0 000 1.062l1.77 1.771c.153.153.327.23.521.23a.718.718 0 00.521-.23l3.896-3.896a.73.73 0 000-1.062.718.718 0 00-.52-.23.718.718 0 00-.521.23l-3.376 3.354zM10 18a7.796 7.796 0 01-3.104-.625 8.064 8.064 0 01-2.552-1.719 8.063 8.063 0 01-1.719-2.552A7.797 7.797 0 012 10c0-1.111.208-2.15.625-3.115a8.064 8.064 0 014.27-4.26A7.797 7.797 0 0110 2c1.111 0 2.15.208 3.115.625a8.095 8.095 0 014.26 4.26C17.792 7.851 18 8.89 18 10a7.797 7.797 0 01-.625 3.104 8.063 8.063 0 01-4.26 4.271A7.774 7.774 0 0110 18z\" fill=\"currentColor\"></path>";
                }

                const nameEl = lessonEl.querySelector('p[data-test="rc-ItemName"]');

                if (nameEl == null) {
                    console.log("No name element found in lesson element", lessonEl);
                    errors.push("No name element found in lesson element");
                    continue;
                }

                const name = nameEl.innerText;

                let type = "unknown";
                let duration: number | undefined = undefined;
                let grade : string | undefined = undefined;
                let deadline : string | undefined;

                const annotationsEl = lessonEl.querySelector('.rc-WeekItemAnnotations');
                if (annotationsEl != null) {
                    const annotationText = annotationsEl.innerText;
                    const annotationsParserResult = annotationsParser(annotationText);

                    if (annotationsParserResult == null) {
                        console.log("Could not parse type from annotation text", annotationText);
                        errors.push("Could not parse type from annotation text: " + annotationText);
                    } else {
                        type = annotationsParserResult.type || "unknown";
                        duration = annotationsParserResult.duration || -1;
                        grade = annotationsParserResult.grade || "";
                        deadline = annotationsParserResult.deadline || "";
                    }
                } else {
                    console.log("No annotations element found in lesson element", lessonEl);
                    errors.push("No annotations element found in lesson element");
                }

                activities.push({
                    name,
                    type,
                    duration,
                    grade,
                    deadline,
                    completed
                });
            }
        }

        setContent("");
        setParsingErrors(errors);

        props.onParse(activities, errors);
    }

    return (
        <div className="w-full overflow-scroll coursera-import-area" style={{
            minHeight: "300px",
            maxHeight: "600px",
            maxWidth: "100%",
            border: "1px solid #ccc",
            padding: "10px"
        }}
             contentEditable={true}
             onBlur={onContentBlur}
             onInput={onContentBlur}
             dangerouslySetInnerHTML={{__html: content}}
        ></div>
    );
}