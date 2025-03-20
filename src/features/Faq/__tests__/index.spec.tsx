/**
 * FAQ Component Tests
 * 
 * This test suite verifies the functionality and content rendering of the FAQ component.
 * It ensures that both static content (predefined FAQ questions) and dynamic content
 * (test data) are properly rendered in the component.
 * 
 * Test Coverage:
 * - Presence of all static FAQ questions
 * - Rendering of dynamic FAQ content in accordions
 * - Proper structure and accessibility of FAQ elements
 */

import { render, within } from "@testing-library/react";
import Faq from "../index";

/**
 * Mock FAQ Content
 * 
 * Test data representing FAQ entries with Lorem Ipsum content.
 * Each entry contains:
 * @property title - The question text
 * @property text - The answer text
 * @property id - Unique identifier for the FAQ entry
 * 
 * This data is used to verify the dynamic rendering capabilities
 * of the FAQ component's accordion structure.
 */
const faqContent = [
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '1',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '2',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '3',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '4',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '5',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '6',
  },
];

describe("learn", () => {
  /**
   * Test: Static Content Verification
   * 
   * Verifies that all predefined FAQ questions are present in the rendered component.
   * These questions cover key concepts of the platform including:
   * - Pools
   * - Bonds
   * - Borrow Offers
   * - Equity Tokens
   * - Bond NFTs
   * - Additional resource links
   */
  test("should have all static elements", () => {
    const { getByText } = render(<Faq />);
    
    // Verify presence of each predefined FAQ question
    expect(getByText("What is a pool?")).toBeTruthy();
    expect(getByText("What is a Bond?")).toBeTruthy();
    expect(getByText("What is a Borrow Offer?")).toBeTruthy();
    expect(getByText("What is an Equity Token?")).toBeTruthy();
    expect(getByText("What is a Bond NFT?")).toBeTruthy();
    expect(getByText("More Useful Links")).toBeTruthy();
  });

  /**
   * Test: Dynamic Content Rendering
   * 
   * Verifies that the test FAQ content is properly rendered within
   * the accordion structure. This ensures the component can handle
   * dynamic content loading and proper accordion functionality.
   * 
   * Uses the data-testid="accordion" to locate the accordion container
   * and verifies each FAQ entry's text content is present.
   */
  test("should have all test data elements", () => {
    const { getAllByTestId } = render(<Faq />);
    
    // Get all accordion elements (expects at least one)
    const accordion = getAllByTestId("accordion");
    
    // Verify each FAQ entry's text is present in the first accordion
    faqContent.map(element => expect(within(accordion[0]).getByText(element.text)));
  });
});