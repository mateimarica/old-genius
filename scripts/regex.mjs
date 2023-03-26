// Annotation URLs, like https://genius.com/5140304
// Matches strings containing genius.com/\<number>
const annotationRegex = /genius\.com\/[0-9]+/; 

// Lyric URLs, like https://genius.com/Don-toliver-slow-motion-lyrics
// Matches string containing genius.com/<string_without_slash>lyrics
const lyricsRegex = /genius\.com\/[^\/]+lyrics/;

// Regexes combined with a logical OR
const regex = annotationRegex.source + '|' + lyricsRegex.source;

export default regex;