import React, { useEffect, useState } from "react";
import axios from "axios";

const PostsPage = () => {
  const [image, setImage] = useState(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]); // fixed state naming

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        "https://chatbackendd-3.onrender.com/user/post"
      );

      let fetchedPosts = [];
      if (Array.isArray(res.data.post)) {
        fetchedPosts = res.data.post;
      } else if (res.data.post) {
        fetchedPosts = [res.data.post];
      }

      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !link) {
      setMessage("Both image and link are required!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("link", link);

    try {
      setLoading(true);
      const res = await axios.post(
        "https://chatbackendd-3.onrender.com/user/post",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.status === "success") {
        setMessage("Post created successfully!");
        setPosts((prevPosts) => [res.data.post, ...prevPosts]);
        setImage(null);
        setLink("");
      } else {
        setMessage("Failed to create post");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Create Post</h1>
      {message && <p>{message}</p>}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
          style={{ padding: "10px" }}
        />

        <input
          type="url"
          placeholder="Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>

      <h2>All Posts</h2>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              )}
              {post.link && (
                <a href={post.link} target="_blank" rel="noopener noreferrer">
                  {post.link}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
