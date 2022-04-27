import NavContainer from "./components/NavContainer"
import MainContainer from "./components/MainContainer"

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function App() {
  return (
    <Container fluid className="p-3">
        <Row noGutters={true}>
            <Col xs={12} lg={4}> <NavContainer /> </Col>
            <Col xs={12} lg={8}> <MainContainer /> </Col>
        </Row>
    </Container>
  );
}

export default App;
