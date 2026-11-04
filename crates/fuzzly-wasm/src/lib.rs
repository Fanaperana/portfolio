//! Typo-tolerant project search for the portfolio, built on `fuzzly`
//! (github.com/Fanaperana/fuzzy-search-rs), compiled to WebAssembly.
//!
//! Each document is a list of terms (title words, tags, language, ...).
//! A query is split into words; every word is matched against every term with
//! fuzzly's Levenshtein similarity (plus a prefix rule so "sem" finds
//! "semtree" while you type). A document's score is the average of each query
//! word's best match, so all words have to match something.

use fuzzly::FuzzySearcher;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SearchIndex {
    terms: Vec<String>,
    owner: Vec<usize>,
    docs: usize,
}

fn tokenize(s: &str) -> Vec<String> {
    s.split(|c: char| !c.is_alphanumeric())
        .filter(|w| !w.is_empty())
        .map(|w| w.to_lowercase())
        .collect()
}

/// Score for a term that starts with the typed word: high, and higher the
/// more of the term has been typed.
fn prefix_score(word: &str, term: &str) -> f64 {
    let (w, t) = (word.chars().count(), term.chars().count());
    if w >= 2 && term.starts_with(word) {
        0.85 + 0.15 * (w as f64 / t as f64)
    } else {
        0.0
    }
}

impl SearchIndex {
    fn score_docs(&self, query: &str, threshold: f64) -> Vec<(usize, f64)> {
        let words = tokenize(query);
        if words.is_empty() {
            return Vec::new();
        }
        let searcher = FuzzySearcher::new(threshold).case_insensitive(true);
        let mut total = vec![0.0f64; self.docs];
        let mut hit_all = vec![true; self.docs];

        for word in &words {
            let mut best = vec![0.0f64; self.docs];
            for m in searcher.search(word, &self.terms) {
                let d = self.owner[m.index];
                best[d] = best[d].max(m.score);
            }
            for (i, term) in self.terms.iter().enumerate() {
                let p = prefix_score(word, term);
                if p > 0.0 {
                    let d = self.owner[i];
                    best[d] = best[d].max(p);
                }
            }
            for d in 0..self.docs {
                if best[d] == 0.0 {
                    hit_all[d] = false;
                }
                total[d] += best[d];
            }
        }

        let n = words.len() as f64;
        let mut out: Vec<(usize, f64)> = (0..self.docs)
            .filter(|&d| hit_all[d])
            .map(|d| (d, total[d] / n))
            .collect();
        out.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        out
    }
}

#[wasm_bindgen]
impl SearchIndex {
    /// `docs` is one string per document; its words become the searchable terms.
    #[wasm_bindgen(constructor)]
    pub fn new(docs: Vec<String>) -> SearchIndex {
        let mut terms = Vec::new();
        let mut owner = Vec::new();
        for (d, text) in docs.iter().enumerate() {
            let mut seen: Vec<String> = Vec::new();
            for t in tokenize(text) {
                if !seen.contains(&t) {
                    seen.push(t.clone());
                    terms.push(t);
                    owner.push(d);
                }
            }
        }
        SearchIndex { terms, owner, docs: docs.len() }
    }

    /// Number of indexed terms (shown in the UI).
    #[wasm_bindgen(getter)]
    pub fn terms(&self) -> usize {
        self.terms.len()
    }

    /// Returns a flat array `[doc, score*1000, doc, score*1000, ...]`, best first.
    pub fn search(&self, query: &str, threshold: f64) -> Vec<u32> {
        self.score_docs(query, threshold)
            .into_iter()
            .flat_map(|(d, s)| [d as u32, (s * 1000.0).round() as u32])
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn idx() -> SearchIndex {
        SearchIndex::new(vec![
            "semtree incremental parser rust".into(),
            "pskey password manager tauri".into(),
            "spdf pdf text extraction rust".into(),
        ])
    }

    fn docs(q: &str) -> Vec<usize> {
        idx().score_docs(q, 0.7).into_iter().map(|(d, _)| d).collect()
    }

    #[test]
    fn exact_and_typo() {
        assert_eq!(docs("pskey")[0], 1);
        assert_eq!(docs("pasword")[0], 1); // one typo
        assert_eq!(docs("semtre")[0], 0);
    }

    #[test]
    fn prefix_while_typing() {
        assert_eq!(docs("sem")[0], 0);
        assert_eq!(docs("extr")[0], 2);
    }

    #[test]
    fn all_words_must_match() {
        assert_eq!(docs("rust pdf"), vec![2]);
        assert!(docs("zzzz").is_empty());
    }
}
