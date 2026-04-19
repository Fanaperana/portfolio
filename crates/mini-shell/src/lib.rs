//! A tiny pipeline language exposed to the browser via WASM.
//!
//! Grammar (informal):
//!   program     := expr
//!   expr        := source ( '|' op )*
//!   source      := 'projects'
//!   op          := 'grep' STRING
//!                | 'lang' STRING
//!                | 'tag'  STRING
//!                | 'star' INT
//!                | 'sort' ('stars'|'recent'|'name')
//!                | 'take' INT
//!                | 'count'
//!                | 'names'
//!                | 'debug'
//!
//! Input data is an array of `Project` objects passed in from JS.
//! Output is a `Value` (list | number | string | projects).

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Project {
    pub slug: String,
    pub title: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub language: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub stars: u32,
    #[serde(default)]
    pub pushed_at: String,
    #[serde(default)]
    pub url: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(tag = "kind", content = "value")]
pub enum Value {
    #[serde(rename = "projects")]
    Projects(Vec<Project>),
    #[serde(rename = "strings")]
    Strings(Vec<String>),
    #[serde(rename = "number")]
    Number(i64),
    #[serde(rename = "text")]
    Text(String),
    #[serde(rename = "error")]
    Error(String),
}

#[derive(Debug)]
enum Token {
    Ident(String),
    Str(String),
    Int(i64),
    Pipe,
}

fn tokenize(src: &str) -> Result<Vec<Token>, String> {
    let mut out = Vec::new();
    let mut chars = src.chars().peekable();
    while let Some(&c) = chars.peek() {
        match c {
            ' ' | '\t' | '\n' => {
                chars.next();
            }
            '|' => {
                chars.next();
                out.push(Token::Pipe);
            }
            '"' | '\'' => {
                let quote = c;
                chars.next();
                let mut s = String::new();
                loop {
                    match chars.next() {
                        Some(ch) if ch == quote => break,
                        Some('\\') => {
                            if let Some(esc) = chars.next() {
                                s.push(esc);
                            }
                        }
                        Some(ch) => s.push(ch),
                        None => return Err("unterminated string".into()),
                    }
                }
                out.push(Token::Str(s));
            }
            c if c.is_ascii_digit() || c == '-' => {
                let mut s = String::new();
                s.push(c);
                chars.next();
                while let Some(&n) = chars.peek() {
                    if n.is_ascii_digit() {
                        s.push(n);
                        chars.next();
                    } else {
                        break;
                    }
                }
                let n: i64 = s.parse().map_err(|_| format!("bad integer: {s}"))?;
                out.push(Token::Int(n));
            }
            c if c.is_ascii_alphabetic() || c == '_' => {
                let mut s = String::new();
                while let Some(&n) = chars.peek() {
                    if n.is_ascii_alphanumeric() || n == '_' || n == '-' {
                        s.push(n);
                        chars.next();
                    } else {
                        break;
                    }
                }
                out.push(Token::Ident(s));
            }
            other => return Err(format!("unexpected char: {other}")),
        }
    }
    Ok(out)
}

fn run(src: &str, projects: Vec<Project>) -> Value {
    let tokens = match tokenize(src) {
        Ok(t) => t,
        Err(e) => return Value::Error(e),
    };
    let mut it = tokens.into_iter().peekable();

    // parse source
    let source = match it.next() {
        Some(Token::Ident(s)) if s == "projects" => Value::Projects(projects),
        Some(Token::Ident(s)) => return Value::Error(format!("unknown source: {s}")),
        _ => return Value::Error("expected a source (e.g. `projects`)".into()),
    };

    let mut current = source;

    loop {
        match it.next() {
            None => break,
            Some(Token::Pipe) => {}
            _ => return Value::Error("expected `|` between stages".into()),
        }
        let op = match it.next() {
            Some(Token::Ident(s)) => s,
            _ => return Value::Error("expected operator after `|`".into()),
        };
        current = apply_op(current, &op, &mut it);
        if let Value::Error(_) = current {
            return current;
        }
    }

    current
}

fn apply_op(
    input: Value,
    op: &str,
    it: &mut std::iter::Peekable<std::vec::IntoIter<Token>>,
) -> Value {
    match op {
        "count" => match input {
            Value::Projects(p) => Value::Number(p.len() as i64),
            Value::Strings(s) => Value::Number(s.len() as i64),
            Value::Number(n) => Value::Number(n),
            _ => Value::Error("cannot count this value".into()),
        },
        "names" => match input {
            Value::Projects(p) => Value::Strings(p.into_iter().map(|x| x.title).collect()),
            other => other,
        },
        "grep" => {
            let needle = match it.next() {
                Some(Token::Str(s)) => s,
                Some(Token::Ident(s)) => s,
                _ => return Value::Error("grep needs a pattern".into()),
            };
            let needle_lc = needle.to_lowercase();
            match input {
                Value::Projects(p) => Value::Projects(
                    p.into_iter()
                        .filter(|x| {
                            x.title.to_lowercase().contains(&needle_lc)
                                || x.description.to_lowercase().contains(&needle_lc)
                                || x.language.to_lowercase().contains(&needle_lc)
                                || x.tags.iter().any(|t| t.to_lowercase().contains(&needle_lc))
                        })
                        .collect(),
                ),
                Value::Strings(ss) => {
                    Value::Strings(ss.into_iter().filter(|s| s.to_lowercase().contains(&needle_lc)).collect())
                }
                other => other,
            }
        }
        "lang" => {
            let want = match it.next() {
                Some(Token::Str(s)) | Some(Token::Ident(s)) => s.to_lowercase(),
                _ => return Value::Error("lang needs a language".into()),
            };
            match input {
                Value::Projects(p) => Value::Projects(
                    p.into_iter().filter(|x| x.language.to_lowercase() == want).collect(),
                ),
                other => other,
            }
        }
        "tag" => {
            let want = match it.next() {
                Some(Token::Str(s)) | Some(Token::Ident(s)) => s.to_lowercase(),
                _ => return Value::Error("tag needs a value".into()),
            };
            match input {
                Value::Projects(p) => Value::Projects(
                    p.into_iter()
                        .filter(|x| x.tags.iter().any(|t| t.to_lowercase() == want))
                        .collect(),
                ),
                other => other,
            }
        }
        "star" => {
            let min = match it.next() {
                Some(Token::Int(n)) => n.max(0) as u32,
                _ => return Value::Error("star needs an integer threshold".into()),
            };
            match input {
                Value::Projects(p) => Value::Projects(p.into_iter().filter(|x| x.stars >= min).collect()),
                other => other,
            }
        }
        "sort" => {
            let key = match it.next() {
                Some(Token::Str(s)) | Some(Token::Ident(s)) => s,
                _ => return Value::Error("sort needs a key (stars|recent|name)".into()),
            };
            match input {
                Value::Projects(mut p) => {
                    match key.as_str() {
                        "stars" => p.sort_by(|a, b| b.stars.cmp(&a.stars)),
                        "recent" => p.sort_by(|a, b| b.pushed_at.cmp(&a.pushed_at)),
                        "name" => p.sort_by(|a, b| a.title.to_lowercase().cmp(&b.title.to_lowercase())),
                        other => return Value::Error(format!("unknown sort key: {other}")),
                    }
                    Value::Projects(p)
                }
                other => other,
            }
        }
        "take" => {
            let n = match it.next() {
                Some(Token::Int(n)) => n.max(0) as usize,
                _ => return Value::Error("take needs an integer".into()),
            };
            match input {
                Value::Projects(mut p) => {
                    p.truncate(n);
                    Value::Projects(p)
                }
                Value::Strings(mut s) => {
                    s.truncate(n);
                    Value::Strings(s)
                }
                other => other,
            }
        }
        "debug" => Value::Text(format!("{input:?}")),
        other => Value::Error(format!("unknown operator: {other}")),
    }
}

#[wasm_bindgen]
pub fn evaluate(source: &str, projects: JsValue) -> Result<JsValue, JsValue> {
    let projects: Vec<Project> = serde_wasm_bindgen::from_value(projects)
        .map_err(|e| JsValue::from_str(&format!("invalid projects input: {e}")))?;
    let result = run(source, projects);
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> Vec<Project> {
        vec![
            Project {
                slug: "minichess".into(),
                title: "minichess".into(),
                description: "Chess TUI".into(),
                language: "Rust".into(),
                tags: vec!["rust".into(), "tui".into()],
                stars: 1,
                pushed_at: "2025-06-26".into(),
                url: "".into(),
            },
            Project {
                slug: "kan".into(),
                title: "kan".into(),
                description: "Kanban".into(),
                language: "TypeScript".into(),
                tags: vec![],
                stars: 5,
                pushed_at: "2023-10-12".into(),
                url: "".into(),
            },
        ]
    }

    #[test]
    fn count_projects() {
        let out = run("projects | count", sample());
        matches!(out, Value::Number(2));
    }

    #[test]
    fn filter_rust() {
        let out = run("projects | lang rust | count", sample());
        matches!(out, Value::Number(1));
    }

    #[test]
    fn grep_and_sort() {
        let out = run("projects | grep chess | sort stars | names", sample());
        if let Value::Strings(names) = out {
            assert_eq!(names, vec!["minichess"]);
        } else {
            panic!("expected Strings");
        }
    }

    #[test]
    fn unknown_op() {
        let out = run("projects | wat", sample());
        assert!(matches!(out, Value::Error(_)));
    }
}
