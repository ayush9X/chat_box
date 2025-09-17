import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Image,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { linked } from "./link";

const PostsPage = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Filter and sort posts
  useEffect(() => {
    let filtered = posts.filter((post) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (post.title || "").toLowerCase().includes(searchLower) ||
        (post.description || "").toLowerCase().includes(searchLower) ||
        (post.link || "").toLowerCase().includes(searchLower)
      );
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "recent":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, sortBy]);

  const fetchPosts = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(
        `${linked}/user/post`
      );


      let fetchedPosts = [];
      if (Array.isArray(res.data.post)) {
        fetchedPosts = res.data.post;
      } else if (res.data.post) {
        fetchedPosts = [res.data.post];
      }

      // Enhance posts with additional mock data for better visualization
      const enhancedPosts = fetchedPosts.map((post) => ({
        ...post,
        title:
          post.title ||
          `Post ${post.id || Math.random().toString(36).substr(2, 9)}`,
        description: post.description || "No description provided",
        createdAt: post.createdAt || new Date().toISOString(),
        likes: post.likes || Math.floor(Math.random() * 100),
        comments: post.comments || Math.floor(Math.random() * 20),
        shares: post.shares || Math.floor(Math.random() * 10),
      }));

      setPosts(enhancedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      showMessage("Error fetching posts", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setImage(null);
    setImagePreview(null);
    setLink("");
    setTitle("");
    setDescription("");
    setEditingPost(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !link) {
      showMessage("Both image and link are required!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("link", link);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);

    try {
      setLoading(true);
      const res = await axios.post(
        `${link}/user/post`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.status === "success") {
        showMessage("Post created successfully!", "success");
        const newPost = {
          ...res.data.post,
          title: title || `Post ${Date.now()}`,
          description: description || "No description provided",
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
        };
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        resetForm();
      } else {
        showMessage("Failed to create post", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error creating post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      setLoading(true);
      // Add your delete API call here
      // await axios.delete(`https://chat-ohmw.onrender.com/user/post/${postId}`);

      // For now, delete locally
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      showMessage("Post deleted successfully!", "success");
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      showMessage("Error deleting post", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 7) return formatDate(dateString);
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return "Just now";
    } catch {
      return "";
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                Posts Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage posts with images and links
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true);
                resetForm();
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              messageType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : messageType === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="ml-auto hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingPost ? "Edit Post" : "Create New Post"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter post description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Image className="inline w-4 h-4 mr-1" />
                      Upload Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <label className="cursor-pointer">
                            <span className="text-blue-500 hover:text-blue-600 font-medium">
                              Click to upload
                            </span>
                            <span className="text-gray-600">
                              {" "}
                              or drag and drop
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              required
                              className="hidden"
                            />
                          </label>
                          <p className="text-gray-500 text-sm mt-2">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Link className="inline w-4 h-4 mr-1" />
                      Link URL *
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Post
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts by title, description, or link..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Posts ({filteredPosts.length})
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first post to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    resetForm();
                  }}
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id || index}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {post.image && (
                    <div className="relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="relative group">
                          <button className="p-1.5 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>

                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              <button
                                onClick={() => setSelectedPost(post)}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-3 h-3" />
                                View Details
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(post)}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {post.title || "Untitled Post"}
                    </h3>

                    {post.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.description}
                      </p>
                    )}

                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 mb-3 truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{post.link}</span>
                      </a>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {post.shares || 0}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Details Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Post Details
                  </h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedPost.image && (
                    <img
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      className="w-full rounded-lg"
                    />
                  )}

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedPost.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedPost.description}
                    </p>

                    {selectedPost.link && (
                      <a
                        href={selectedPost.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-2 mb-4"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Link
                      </a>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {selectedPost.likes} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {selectedPost.comments} comments
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          {selectedPost.shares} shares
                        </span>
                      </div>
                      <span>Created {formatDate(selectedPost.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delete Post
                  </h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "
                  <strong>{deleteConfirm.title}</strong>"? This action cannot be
                  undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? "Deleting..." : "Delete Post"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
