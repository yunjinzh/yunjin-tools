// Preserve bookmarked routes from the original Book 4 homepage.
if(/^#\/(map|unit|bag|review|parents|final|library)(\/|$)/.test(location.hash))location.replace('book.html?book=4'+location.hash);
