import React from 'react';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';

const destinations = [
  { title: 'Paris', description: 'The city of lights!', img: 'https://via.placeholder.com/300x200' },
  { title: 'Tokyo', description: 'Tradition meets future.', img: 'https://via.placeholder.com/300x200' },
  { title: 'New York', description: 'The city that never sleeps.', img: 'https://via.placeholder.com/300x200' },
];

const TravelCards = () => (
  <Container className="my-5">
    <Row>
      {destinations.map((dest, idx) => (
        <Col md={4} key={idx} className="mb-4">
          <Card>
            <Card.Img variant="top" src={dest.img} />
            <Card.Body>
              <Card.Title>{dest.title}</Card.Title>
              <Card.Text>{dest.description}</Card.Text>
              <Button variant="primary">Explore</Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

export default TravelCards;
