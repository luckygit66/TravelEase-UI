import React from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const SearchBar = () => (
  <Container className="my-4">
    <Row className="justify-content-center">
      <Col md={8}>
        <Form className="d-flex">
          <Form.Control
            type="search"
            placeholder="Where do you want to go?"
            className="me-2"
          />
          <Button variant="primary">Search</Button>
        </Form>
      </Col>
    </Row>
  </Container>
);

export default SearchBar;
