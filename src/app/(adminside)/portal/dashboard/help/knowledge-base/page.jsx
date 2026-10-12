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
  cilBook, 
  cilSearch, 
  cilTag,
  cilStar,
  cilClock,
  cilUser,
  cilViewModule
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = [
    { id: "All", name: "All Articles", count: 45, icon: cilBook },
    { id: "Getting Started", name: "Getting Started", count: 8, icon: cilUser },
    { id: "Properties", name: "Properties & Listings", count: 12, icon: cilBook },
    { id: "Leads", name: "Lead Management", count: 10, icon: cilUser },
    { id: "Communication", name: "Communication", count: 7, icon: cilBook },
    { id: "Billing", name: "Billing & Payments", count: 5, icon: cilBook },
    { id: "Technical", name: "Technical Issues", count: 3, icon: cilBook }
  ];

  const articles = [
    {
      id: 1,
      title: "How to create your first property listing",
      category: "Properties",
      content: `# Creating Your First Property Listing

This comprehensive guide will walk you through creating your first property listing on our platform.

## Step 1: Access the Listings Section
1. Navigate to the Properties section in your dashboard
2. Click on "Add New Property"
3. You'll be taken to the property listing form

## Step 2: Basic Information
Fill in the basic details:
- **Property Type**: Select from Residential, Commercial, Plot, etc.
- **Listing Type**: Choose Sale, Rent, or Lease
- **Property Title**: Create an attractive title
- **Description**: Write a detailed description

## Step 3: Location Details
- **City**: Select your city
- **Area**: Enter the specific area or locality
- **Address**: Provide the complete address
- **Landmark**: Add nearby landmarks for easy identification

## Step 4: Property Details
- **Bedrooms**: Number of bedrooms
- **Bathrooms**: Number of bathrooms
- **Built-up Area**: Total built-up area in sq ft
- **Carpet Area**: Usable carpet area in sq ft
- **Floor**: Floor number
- **Total Floors**: Total floors in the building

## Step 5: Pricing
- **Price**: Enter the property price
- **Price Per Sq Ft**: Automatically calculated
- **Maintenance**: Monthly maintenance charges
- **Other Charges**: Any additional charges

## Step 6: Amenities & Features
Select from available amenities:
- Swimming Pool
- Gymnasium
- Parking
- Security
- Garden
- And many more...

## Step 7: Images & Documents
- Upload high-quality property images
- Add floor plans
- Upload relevant documents

## Step 8: Review & Publish
- Review all information
- Preview your listing
- Click "Publish" to make it live

## Tips for Better Listings
1. Use high-quality images
2. Write compelling descriptions
3. Be accurate with measurements
4. Highlight unique features
5. Keep pricing competitive

Need more help? Contact our support team!`,
      excerpt: "Learn how to create and publish your first property listing on the platform with detailed step-by-step instructions.",
      views: 1250,
      helpful: 89,
      lastUpdated: "2024-01-15",
      tags: ["listing", "property", "tutorial", "beginner"],
      featured: true,
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Managing leads and inquiries effectively",
      category: "Leads",
      content: `# Managing Leads and Inquiries Effectively

Learn how to efficiently manage your property leads and convert inquiries into successful deals.

## Understanding Lead Management
Lead management is crucial for real estate success. It involves:
- Tracking potential clients
- Following up on inquiries
- Converting prospects into buyers/renters
- Maintaining client relationships

## Lead Sources
Your leads can come from:
- Property listings
- Website inquiries
- Referrals
- Social media
- Direct contact

## Lead Classification
Classify your leads based on:
- **Hot Leads**: Ready to buy/rent immediately
- **Warm Leads**: Interested but need time
- **Cold Leads**: Initial inquiry, needs nurturing

## Follow-up Strategies
1. **Immediate Response**: Reply within 30 minutes
2. **Personalized Messages**: Customize your communication
3. **Regular Follow-ups**: Don't let leads go cold
4. **Value Addition**: Provide market insights and tips

## Using the CRM System
Our CRM helps you:
- Track all interactions
- Set follow-up reminders
- Store client information
- Analyze lead conversion rates

## Best Practices
1. Respond quickly to inquiries
2. Keep detailed notes
3. Use templates for common responses
4. Schedule regular follow-ups
5. Measure and improve your conversion rate

## Common Mistakes to Avoid
- Delayed responses
- Generic messages
- Not following up
- Poor record keeping
- Ignoring lead quality`,
      excerpt: "Best practices for managing your property leads, responding to inquiries, and converting prospects into clients.",
      views: 980,
      helpful: 76,
      lastUpdated: "2024-01-12",
      tags: ["leads", "inquiries", "management", "crm"],
      featured: false,
      difficulty: "Intermediate"
    },
    {
      id: 3,
      title: "Setting up automated email templates",
      category: "Communication",
      content: `# Setting Up Automated Email Templates

Streamline your communication with potential buyers and sellers using automated email templates.

## Why Use Email Templates?
- Save time on repetitive tasks
- Ensure consistent messaging
- Improve response rates
- Professional communication
- Better lead nurturing

## Creating Your First Template
1. Go to Communication > Templates
2. Click "Create New Template"
3. Choose a template category
4. Write your template content
5. Add dynamic variables
6. Test and save

## Template Categories
- **Lead Response**: Initial inquiry responses
- **Follow-up**: Regular follow-up messages
- **Site Visit**: Visit confirmation and details
- **Negotiation**: Price discussion templates
- **Documentation**: Document request templates

## Dynamic Variables
Use these variables in your templates:
- {{name}} - Client name
- {{property_title}} - Property title
- {{agent_name}} - Your name
- {{visit_date}} - Scheduled visit date
- {{property_address}} - Property address

## Template Best Practices
1. **Personalization**: Use client names and property details
2. **Clear Subject Lines**: Make them specific and compelling
3. **Call to Action**: Include clear next steps
4. **Professional Tone**: Maintain a professional yet friendly tone
5. **Mobile Friendly**: Ensure templates look good on mobile

## Automation Rules
Set up rules for:
- Automatic responses to new inquiries
- Follow-up sequences
- Visit confirmations
- Document reminders

## Measuring Success
Track these metrics:
- Open rates
- Click-through rates
- Response rates
- Conversion rates

## Common Template Types
1. **Welcome Message**: For new inquiries
2. **Visit Confirmation**: Site visit details
3. **Follow-up**: After property visits
4. **Price Discussion**: Negotiation templates
5. **Document Request**: KYC and other documents`,
      excerpt: "Create and customize email templates to streamline your communication with potential buyers and sellers.",
      views: 756,
      helpful: 65,
      lastUpdated: "2024-01-10",
      tags: ["email", "templates", "automation", "communication"],
      featured: false,
      difficulty: "Intermediate"
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
  };

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      "Beginner": "success",
      "Intermediate": "warning",
      "Advanced": "danger"
    };
    return variants[difficulty] || "secondary";
  };

  return (
    <div className="knowledge-base-page">
      {/* Header */}
      <div className="page-header page-header-gradient">
        <div className="header-content">
          <div className="header-title">
            <h2>Knowledge Base</h2>
            <p>Find comprehensive guides and tutorials to help you succeed</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="search-card mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup size="lg">
              <InputGroup.Text>
                <CIcon icon={cilSearch} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search articles, guides, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Search
              </Button>
            </InputGroup>
          </Form>
          <div className="search-suggestions mt-3">
            <small className="text-muted">Popular searches:</small>
            <div className="suggestion-tags">
              <Badge bg="light" text="dark" className="me-1 mb-1">property listing</Badge>
              <Badge bg="light" text="dark" className="me-1 mb-1">lead management</Badge>
              <Badge bg="light" text="dark" className="me-1 mb-1">email templates</Badge>
              <Badge bg="light" text="dark" className="me-1 mb-1">billing</Badge>
            </div>
          </div>
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

        {/* Articles Content */}
        <Col lg={9}>
          {selectedArticle ? (
            // Article Detail View
            <Card className="article-detail-card">
              <Card.Header>
                <div className="article-header">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSelectedArticle(null)}
                    className="me-3"
                  >
                    ← Back to Articles
                  </Button>
                  <div className="article-meta">
                    <Badge bg="secondary" className="me-2">{selectedArticle.category}</Badge>
                    <Badge bg={getDifficultyBadge(selectedArticle.difficulty)} className="me-2">
                      {selectedArticle.difficulty}
                    </Badge>
                    {selectedArticle.featured && <Badge bg="primary">Featured</Badge>}
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="article-content">
                  <h1 className="article-title">{selectedArticle.title}</h1>
                  <div className="article-stats mb-4">
                    <small className="text-muted me-3">
                      <CIcon icon={cilViewModule} className="me-1" />
                      {selectedArticle.views} views
                    </small>
                    <small className="text-muted me-3">
                      <CIcon icon={cilStar} className="me-1" />
                      {selectedArticle.helpful}% helpful
                    </small>
                    <small className="text-muted">
                      <CIcon icon={cilClock} className="me-1" />
                      Updated {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                    </small>
                  </div>
                  
                  <div className="article-body">
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br />') }} />
                  </div>
                  
                  <div className="article-tags mt-4">
                    <h6>Tags:</h6>
                    {selectedArticle.tags.map(tag => (
                      <Badge key={tag} bg="light" text="dark" className="me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            // Articles List View
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
                      <ListGroup.Item 
                        key={article.id} 
                        className="article-item"
                        onClick={() => setSelectedArticle(article)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="article-content">
                          <div className="article-header">
                            <div className="article-badges">
                              <Badge bg="secondary" className="me-2">{article.category}</Badge>
                              <Badge bg={getDifficultyBadge(article.difficulty)} className="me-2">
                                {article.difficulty}
                              </Badge>
                              {article.featured && <Badge bg="primary">Featured</Badge>}
                            </div>
                            <div className="article-stats">
                              <small className="text-muted">
                                <CIcon icon={cilViewModule} className="me-1" />
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
          )}
        </Col>
      </Row>

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

        .article-item {
          border: none;
          border-bottom: 1px solid #e9ecef;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .article-item:hover {
          background: #f8f9fa;
        }

        .article-item:last-child {
          border-bottom: none;
        }

        .article-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .article-badges {
          display: flex;
          gap: 0.5rem;
        }

        .article-stats {
          display: flex;
          gap: 1rem;
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

        .article-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .article-detail-card .article-title {
          font-size: 2rem;
          font-weight: 700;
          color: #495057;
          margin-bottom: 1rem;
        }

        .article-body {
          line-height: 1.8;
          color: #495057;
        }

        .article-body h1, .article-body h2, .article-body h3 {
          color: #495057;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .article-body h1:first-child, .article-body h2:first-child, .article-body h3:first-child {
          margin-top: 0;
        }

        .article-body ul, .article-body ol {
          padding-left: 2rem;
          margin-bottom: 1rem;
        }

        .article-body li {
          margin-bottom: 0.5rem;
        }

        .article-body code {
          background: #f8f9fa;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 768px) {
          .knowledge-base-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .article-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
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
