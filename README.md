This blog uses the [org-static-blog](https://github.com/bastibe/org-static-blog) to generate static HTML pages from Org files.

This blog also contains a customized styling, a [MathJax rendering](https://github.com/bastibe/org-static-blog/issues/72#issuecomment-1304825110) and a global search feature.

Here is the Doom Emacs configuration this blog uses, one should at least change `org-static-blog-publish-title`, `org-static-blog-publish-url`, `author`, any social link, `org-static-blog-page-postamble` and `org-static-blog-index-front-matter` for their own blog. Note that for other Emacs the syntax is different (e.g., ~after!~ is invalid in Spacemacs)!

``` emacs-lisp
;; org-static-blog config
(setq org-static-blog-publish-title "Chenyo's Blog")
(setq org-static-blog-publish-url "https://chenyo.me")
(setq org-static-blog-publish-directory "~/org-static-blog/")
(setq org-static-blog-posts-directory "~/org-static-blog/posts/")
(setq org-static-blog-drafts-directory "~/org-static-blog/drafts/")
(setq org-static-blog-enable-tags t)
(setq org-export-with-toc t)
(setq org-export-with-section-numbers t)

(setq org-static-blog-page-header
      "<script type=\"text/javascript\"
             src=\"https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML\">
       </script>
       <script type=\"text/x-mathjax-config\">
             MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'],['\\\\(','\\\\)']]}});
       </script>
       <meta name=\"author\" content=\"chenyo\">
      <meta name=\"referrer\" content=\"no-referrer\">
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
      <link rel=\"stylesheet\" href=\"assets/style.css\" type=\"text/css\"/>
      <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css\"/>
      <link rel=\"favicon\" type=\"image/x-icon\" href=\"favicon.ico\">
      <script src=\"assets/search.js\"></script>")

;; Postamble for every page (e.g., footer)
(setq org-static-blog-page-postamble
      "<div id=\"search-results\"></div>
      <footer>
        <p>© 2024 chenyo. Some rights reserved.</p>
        <div class=\"social-links\">
          <a href=\"https://t.me/feihuadawangjiushiwo\" target=\"_blank\" rel=\"noopener noreferrer\">
          <i class=\"fab fa-telegram\"></i>
          </a>
          <a href=\"https://github.com/chenyo-17\" target=\"_blank\" rel=\"noopener noreferrer\">
            <i class=\"fab fa-github\"></i>
      </a>
      </div>
      </footer>")

;; Preamble for every page (e.g., navigation)
(setq org-static-blog-page-preamble
      (format "
      <header>
      <h1><a href=\"%s\">Chenyo's org-static-blog</a></h1>
      <nav>
      <a href=\"%s\">Home</a>
      <a href=\"archive.html\">Archive</a>
      <a href=\"tags.html\">Tags</a>
      <div id=\"search-container\">
        <input type=\"text\" id=\"search-input\" placeholder=\"Search anywhere...\">
        <i class=\"fas fa-search search-icon\"></i>
      </div>
      </nav>
      </header>"
              org-static-blog-publish-url
              org-static-blog-publish-url))


;; Content for the front page
(setq org-static-blog-index-front-matter
      "<h2>Welcome!</h2>
      <p>Take a look if you are bored.</p>")

(after! org-static-blog
  (defun update-post-list (&rest _)
    "Update the post list in post-list.json."
    (let* ((post-list (mapcar 'org-static-blog-get-post-url
                              (org-static-blog-get-post-filenames)))
           (json-encoding-pretty-print t)
           (json-data (json-encode post-list)))
      (with-temp-file (concat org-static-blog-publish-directory "assets/post-list.json")
        (insert json-data))
      (message "Updated post-list.json")))

  (advice-add 'org-static-blog-publish :after #'update-post-list))
```
