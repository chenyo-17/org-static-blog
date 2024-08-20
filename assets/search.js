/* A client-side global search function for all blog posts. */

// Ensure the code only runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const content = document.getElementById("content"); // the main post content
  let allPosts = []; // array to store all trimmed posts

  // Wait for all posts to be loaded.
  fetchAllPosts()
    .then((posts) => {
      allPosts = posts;
    })
    .catch((error) => console.error("Error loading posts:", error));

  searchInput.addEventListener("input", function () {
    const query = this.value;
    // Ignore too short query
    if (query.length < 2) {
      showOriginalContent();
      return;
    }

    // First filter posts that contain the query.
    const results = allPosts.filter(
      (post) =>
        postContainsQuery(post.title, query) ||
        postContainsQuery(post.content, query),
    );

    displayResults(results, query);
  });

  // Immediately return true if the text contains the query.
  function postContainsQuery(text, query) {
    // Add backslash to all special characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i"); // case-insensitive
    return regex.test(text);
  }

  /**
   * Display the search results.
   * @param {Array} results - The filtered posts that contain the query.
   * @param {string} query - The search query.
   */
  function displayResults(results, query) {
    searchResults.innerHTML = "";
    if (results.length === 0) {
      searchResults.innerHTML = "<p>No results found.</p>";
    } else {
      results.forEach((result) => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("search-result");

        const title = document.createElement("a");
        title.href = result.url; // link to the post
        title.innerHTML = highlightText(result.title, query);
        resultItem.appendChild(title);

        const snippets = getAllSnippets(result.content, query, result.headers);
        if (snippets.length > 0) {
          snippets.forEach((snippet) => {
            const snippetDiv = document.createElement("div");
            snippetDiv.classList.add("search-result-snippet");

            const snippetUrl = snippet.anchor
              ? `${result.url}#${snippet.anchor}`
              : result.url;

            snippetDiv.innerHTML = `<a href="${snippetUrl}" class="snippet-link">${snippet.text}</a>`;

            resultItem.appendChild(snippetDiv);
          });
        } else if (!title.innerHTML.includes("<mark>")) {
          return;
        }

        searchResults.appendChild(resultItem);
      });

      document.querySelectorAll(".snippet-link").forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const url = this.getAttribute("href");
          navigateToPost(url);
        });
      });
    }
    content.style.display = "none"; // hide the original content
    searchResults.style.display = "block";
  }

  /**
   * Highlight the text that contains the query.
   * @param {string} text - The text to highlight.
   * @param {string} query - The search query.
   * @returns {string} The highlighted text.
   */
  function highlightText(text, query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "gi");
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  }

  function showOriginalContent() {
    content.style.display = "block";
    searchResults.style.display = "none";
  }

  /**
   * Get all snippets of the content that contain the query.
   * @param {string} content - The content to search in.
   * @param {string} query - The search query.
   * @param {Array} headers - The headers of the content.
   * @returns {Array} The snippets of the content that contain the query,
   *   each with the following properties:
   *   - text: the highlighted snippet
   *   - anchor: the id of the nearest header
   */
  function getAllSnippets(content, query, headers) {
    const snippets = [];
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "gi");
    const contextSize = 30; // context size in each side of the query

    let match;
    while ((match = regex.exec(content)) !== null) {
      const index = match.index;
      let start = Math.max(0, index - contextSize);
      let end = Math.min(content.length, index + query.length + contextSize);

      // Ensure the snippet starts and ends with complete words
      while (start > 0 && /\S/.test(content[start])) start--;
      while (end < content.length && /\S/.test(content[end])) end++;

      let snippet = content.slice(start, end).replace(/\s+/g, " ").trim();

      // Sanitize the snippet to avoid HTML injection in some code blocks
      snippet = snippet.replace(/[<>]/g, "") 
      .replace(/[*_~`]/g, '') 
      .replace(/\s+/g, ' ') 
      .trim();

      const highlightedSnippet = snippet.replace(
        new RegExp(escapedQuery, "gi"),
        (match) => `<mark>${match}</mark>`,
      );

      if (highlightedSnippet.includes("<mark>")) {
        const nearestHeader = findNearestHeader(index, headers);

        snippets.push({
          text:
            (start > 0 ? "..." : "") +
            highlightedSnippet +
            (end < content.length ? "..." : ""),
          anchor: nearestHeader ? nearestHeader.id : "",
        });
      }
      
      // Move the regex to the end of the snippet to avoid duplicate matches
      regex.lastIndex = end;
    }

    return snippets;
  }

  /**
   * Find the nearest header to the query.
   * @param {number} queryIndex - The index of the query in the trimmed content.
   * @param {Array} headers - The headers array.
   * @returns {Object} The nearest header with the following properties:
   *   - id: the header id
   *   - index: the index of the header in the trimmed content
   *   - text: the text of the header
   */
  function findNearestHeader(queryIndex, headers) {
    return headers.reduce((nearest, current) => {
      if (
        current.index <= queryIndex &&
        (!nearest || current.index > nearest.index)
      ) {
        return current;
      }
      return nearest;
    }, null);
  }

  /**
   * Navigate to the post.
   * @param {string} url - The URL of the post.
   */
  function navigateToPost(url) {
    const [baseUrl, anchor] = url.split("#");

    fetch(baseUrl)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newContent = doc.getElementById("content");

        if (newContent) {
          document.getElementById("content").innerHTML = newContent.innerHTML;
          history.pushState(null, "", url);

          setTimeout(() => {
            if (anchor) {
              const element = document.getElementById(anchor);
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }
          }, 100);

          document.getElementById("content").style.display = "block";
          document.getElementById("search-results").style.display = "none";
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  /**
   * Fetches and trims all posts from the post-list.json file.
   * @returns {Promise<Array>} An array of posts, each with the following properties:
   *   - url: the URL of the post
   *   - title: the title of the post
   *   - content: the trimmed content of the post
   *   - headers: an array of headers with their positions
   *     - id: the id of the header
   *     - index: the index of the header in the trimmed content
   *     - text: the text of the header
   */
  async function fetchAllPosts() {
    try {
      // Fetch a list of all blog posts urls
      const response = await fetch("assets/post-list.json");
      // for local testing
      // const response = await fetch(
      //   "https://chenyo-17.github.io/org-static-blog/assets/post-list.json",
      // );
      const postUrls = await response.json();

      // Fetch content for each blog post
      const posts = await Promise.all(
        postUrls.map(async (url) => {
          const postResponse = await fetch(url);
          const postHtml = await postResponse.text();
          const parser = new DOMParser();
          const postDoc = parser.parseFromString(postHtml, "text/html");
          const content = postDoc.getElementById("content");

          // Fetch and trim the title
          const title =
            content.querySelector(".post-title a")?.textContent.trim() || "";

          // Remove title, toc, postamble, and taglist from the content
          const postDate = content.querySelector(".post-date");
          if (postDate) postDate.remove();
          const postTitle = content.querySelector(".post-title");
          if (postTitle) postTitle.remove();
          const toc = content.querySelector("#table-of-contents");
          if (toc) toc.remove();
          const taglist = content.querySelector(".taglist");
          if (taglist) taglist.remove();
          const postamble = content.querySelector("#postamble");
          if (postamble) postamble.remove();

          // Trim the content before extracting headers
          const cleanContent = content.textContent.replace(/\s+/g, " ").trim();

          // Extract headers with their positions
          // Cannot directly query the cleanContent as they are strings!
          const headers = Array.from(
            content.querySelectorAll("h1, h2, h3, h4, h5, h6"),
          ).map((header, index) => {
            const headerText = header.textContent.replace(/\s+/g, " ").trim();
            let headerIndex = cleanContent.indexOf(headerText);

            if (headerIndex === -1) {
              console.warn(`Header not found: "${headerText}"`);
            }

            return {
              // h1 does not have an id attribute
              id: header.id,  // h1 does not have an id
              index: headerIndex,
              text: headerText,
            };
          });

          return {
            url: url,
            title: title,
            content: cleanContent,
            headers: headers,
          };
        }),
      );

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }
});
