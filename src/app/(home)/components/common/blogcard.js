import Image from "next/image";
import Link from "next/link";
import { getBlogAuthorDisplayName } from "./blogAuthor";
import { HOME_BLOG_CARD_SIZES } from "@/lib/optimizedImage";
import './common.css';

const truncateWords = (text, wordLimit) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + " ...";
};

export default function BlogCard({ blog }) {

    const featuredImageAlt = blog.blogTitle
      ? `${blog.blogTitle} — blog featured image on My Property Fact`
      : "Blog featured image on My Property Fact";

    const authorLabel = getBlogAuthorDisplayName(blog, "My Property Fact");

    const imageSrc = blog.blogImage
      ? `${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${blog.blogImage}`
      : "/static/no_image.png";

    return (
        <>
            <Link href={`/blog/${blog.slugUrl}`}
                className="card border-0 rounded-4 overflow-hidden blog-card my-3 text-decoration-none"
                title={blog?.blogTitle ? `Read ${blog.blogTitle}` : "Read blog post"}
            >
                <Image
                    src={imageSrc}
                    alt={featuredImageAlt}
                    title={featuredImageAlt}
                    width={800}
                    height={450}
                    sizes={HOME_BLOG_CARD_SIZES}
                    quality={65}
                    loading="lazy"
                    fetchPriority="low"
                    className="img-fluid"
                />
                <div className="card-body d-flex flex-column plus-jakarta-semi-bold">
                    <p className="blog-date m-0 mb-1 text-muted small">
                        By <span className="fw-semibold text-body">{authorLabel}</span>
                        {blog.createdAt ? (
                            <>
                                {" · "}
                                {new Date(blog.createdAt).toLocaleString("en-US", {
                                    dateStyle: "medium",
                                })}
                            </>
                        ) : null}
                    </p>
                    <h3 className="card-title fw-bold h4" title={blog.blogTitle}>{blog.blogTitle}</h3>

                    <div className="flex-grow-1 mb-1">
                        <p className="card-text text-muted small">
                            {truncateWords(blog.blogMetaDescription || 'Click below to continue reading...', 50)}
                        </p>
                    </div>

                    <button className="plus-jakarta-sans-regular mt-1 btn-continue-reading">
                        Continue Reading...
                    </button>
                </div>
            </Link>
        </>
    )
}
