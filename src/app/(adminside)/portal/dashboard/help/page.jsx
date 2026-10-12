"use client";
import { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form,
  InputGroup,
  ListGroup,
  Badge,
  Alert
} from "react-bootstrap";
import { 
  cilInfo, 
  cilSearch, 
  cilBook, 
  cilEnvelopeOpen,
  cilPhone,
  cilChatBubble,
  cilStar,
  cilClock,
  cilUser
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { id: "All", name: "All Categories", count: 45, icon: cilInfo },
    { id: "Getting Started", name: "Getting Started", count: 8, icon: cilInfo },
    { id: "Properties", name: "Properties & Listings", count: 12, icon: cilBook },
    { id: "Leads", name: "Lead Management", count: 10, icon: cilUser },
    { id: "Communication", name: "Communication", count: 7, icon: cilEnvelopeOpen },
    { id: "Billing", name: "Billing & Payments", count: 5, icon: cilInfo },
    { id: "Technical", name: "Technical Issues", count: 3, icon: cilInfo }
  ];

  const articles = [
    {
      id: 1,
      title: "How to create your first property listing",
      category: "Properties",
      excerpt: "Learn how to create and publish your first property listing on the platform with detailed step-by-step instructions.",
      views: 1250,
      helpful: 89,
      lastUpdated: "2024-01-15",
      tags: ["listing", "property", "tutorial"],
      featured: true
    },
    {
      id: 2,
      title: "Managing leads and inquiries effectively",
      category: "Leads",
      excerpt: "Best practices for managing your property leads, responding to inquiries, and converting prospects into clients.",
      views: 980,
      helpful: 76,
      lastUpdated: "2024-01-12",
      tags: ["leads", "inquiries", "management"],
      featured: false
    },
    {
      id: 3,
      title: "Setting up automated email templates",
      category: "Communication",
      excerpt: "Create and customize email templates to streamline your communication with potential buyers and sellers.",
      views: 756,
      helpful: 65,
      lastUpdated: "2024-01-10",
      tags: ["email", "templates", "automation"],
      featured: false
    },
    {
      id: 4,
      title: "Understanding your billing and subscription",
      category: "Billing",
      excerpt: "Everything you need to know about your subscription plan, billing cycles, and payment methods.",
      views: 634,
      helpful: 58,
      lastUpdated: "2024-01-08",
      tags: ["billing", "subscription", "payments"],
      featured: false
    },
    {
      id: 5,
      title: "Getting started with the platform",
      category: "Getting Started",
      excerpt: "A comprehensive guide to help you get up and running with the property portal platform.",
      views: 2100,
      helpful: 95,
      lastUpdated: "2024-01-05",
      tags: ["getting started", "onboarding", "guide"],
      featured: true
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter(article => article.featured);
  const recentArticles = articles.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 3);

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
  };

  return (
    <div className="help-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Help & Support</h2>
            <p>Find answers to your questions and get the support you need</p>
          </div>
          <div className="header-actions">
            <Button variant="primary" className="me-2">
              <CIcon icon={cilEnvelopeOpen} className="me-1" />
              Contact Support
            </Button>
            <Button variant="outline-light">
              <CIcon icon={cilPhone} className="me-1" />
              Call Us
            </Button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="search-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <InputGroup.Text>
                    <CIcon icon={cilSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search for help articles, guides, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                  />
                  <Button variant="primary" type="submit">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={4}>
              <div className="search-suggestions">
                <small className="text-muted">Popular searches:</small>
                <div className="suggestion-tags">
                  <Badge bg="light" text="dark" className="me-1 mb-1">property listing</Badge>
                  <Badge bg="light" text="dark" className="me-1 mb-1">lead management</Badge>
                  <Badge bg="light" text="dark" className="me-1 mb-1">email templates</Badge>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Categories Sidebar */}
        <Col lg={3}>
          <Card className="categories-card">
            <Card.Header>
              <h5 className="mb-0">Categories</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {categories.map(category => (
                  <ListGroup.Item 
                    key={category.id}
                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="category-content">
                      <CIcon icon={category.icon} className="category-icon" />
                      <div className="category-info">
                        <div className="category-name">{category.name}</div>
                        <small className="category-count">{category.count} articles</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          {/* Featured Articles */}
          {selectedCategory === "All" && (
            <Card className="featured-articles-card mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <CIcon icon={cilStar} className="me-2" />
                  Featured Articles
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {featuredArticles.map(article => (
                    <Col md={6} key={article.id}>
                      <div className="featured-article">
                        <div className="article-header">
                          <Badge bg="primary" className="me-2">Featured</Badge>
                          <Badge bg="secondary">{article.category}</Badge>
                        </div>
                        <h6 className="article-title">{article.title}</h6>
                        <p className="article-excerpt">{article.excerpt}</p>
                        <div className="article-meta">
                          <small className="text-muted">
                            <CIcon icon={cilClock} className="me-1" />
                            Updated {new Date(article.lastUpdated).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Articles List */}
          <Card className="articles-card">
            <Card.Header>
              <h5 className="mb-0">
                {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`} 
                ({filteredArticles.length})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredArticles.length > 0 ? (
                <ListGroup variant="flush">
                  {filteredArticles.map(article => (
                    <ListGroup.Item key={article.id} className="article-item">
                      <div className="article-content">
                        <div className="article-header">
                          <div className="article-badges">
                            <Badge bg="secondary" className="me-2">{article.category}</Badge>
                            {article.featured && <Badge bg="primary">Featured</Badge>}
                          </div>
                          <div className="article-stats">
                            <small className="text-muted">
                              <CIcon icon={cilInfo} className="me-1" />
                              {article.views} views
                            </small>
                            <small className="text-muted ms-3">
                              <CIcon icon={cilStar} className="me-1" />
                              {article.helpful}% helpful
                            </small>
                          </div>
                        </div>
                        
                        <h6 className="article-title">{article.title}</h6>
                        <p className="article-excerpt">{article.excerpt}</p>
                        
                        <div className="article-footer">
                          <div className="article-tags">
                            {article.tags.map(tag => (
                              <Badge key={tag} bg="light" text="dark" className="me-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="article-meta">
                            <small className="text-muted">
                              <CIcon icon={cilClock} className="me-1" />
                              Updated {new Date(article.lastUpdated).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="no-results">
                  <CIcon icon={cilSearch} size="3xl" className="text-muted mb-3" />
                  <h6>No articles found</h6>
                  <p className="text-muted">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Support Section */}
      <Card className="contact-support-card mt-4">
        <Card.Body>
          <Row className="g-4">
            <Col md={4}>
              <div className="contact-method">
                <div className="contact-icon">
                  <CIcon icon={cilEnvelopeOpen} />
                </div>
                <h6>Email Support</h6>
                <p>Get help via email within 24 hours</p>
                <Button variant="outline-primary">
                  <CIcon icon={cilEnvelopeOpen} className="me-1" />
                  Send Email
                </Button>
              </div>
            </Col>
            <Col md={4}>
              <div className="contact-method">
                <div className="contact-icon">
                  <CIcon icon={cilPhone} />
                </div>
                <h6>Phone Support</h6>
                <p>Call us for immediate assistance</p>
                <Button variant="outline-primary">
                  <CIcon icon={cilPhone} className="me-1" />
                  Call Now
                </Button>
              </div>
            </Col>
            {/* <Col md={4}>
              <div className="contact-method">
                <div className="contact-icon">
                  <CIcon icon={cilChatBubble} />
                </div>
                <h6>Live Chat</h6>
                <p>Chat with our support team in real-time</p>
                <Button variant="primary">
                  <CIcon icon={cilChatBubble} className="me-1" />
                  Start Chat
                </Button>
              </div>
            </Col> */}
          </Row>
        </Card.Body>
      </Card>

      <style jsx>{`
        /* Common styles are now in PortalCommonStyles.css */
        /* Only page-specific styles below */

        .search-suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .category-item {
          border: none;
          border-bottom: 1px solid #e9ecef;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .category-item:hover {
          background: #f8f9fa;
        }

        .category-item.active {
          background: #e3f2fd;
          border-left: 4px solid #667eea;
        }

        .category-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-icon {
          font-size: 1.25rem;
          color: #667eea;
        }

        .category-name {
          font-weight: 600;
          color: #495057;
        }

        .category-count {
          color: #6c757d;
        }

        .featured-article {
          padding: 1.5rem;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: #f8f9fa;
          height: 100%;
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .article-title {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.75rem;
        }

        .article-excerpt {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .article-meta {
          display: flex;
          align-items: center;
        }

        .article-item {
          border: none;
          border-bottom: 1px solid #e9ecef;
          padding: 1.5rem;
        }

        .article-item:last-child {
          border-bottom: none;
        }

        .article-badges {
          display: flex;
          gap: 0.5rem;
        }

        .article-stats {
          display: flex;
          gap: 1rem;
        }

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        .contact-method {
          text-align: center;
          padding: 1.5rem;
        }

        .contact-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0 auto 1rem;
        }

        .contact-method h6 {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .contact-method p {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .help-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .article-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .article-stats {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
