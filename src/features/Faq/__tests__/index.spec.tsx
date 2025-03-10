import { render, within } from "@testing-library/react";
import Faq from "../index";

const faqContent = [
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '1',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '2',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '3',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '4',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '5',
  },
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam?',
    text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel",
    id: '6',
  },
];
describe("learn", () => {
  test("should have all static elements", () => {
    const { getByText } = render(<Faq />);
    expect(getByText("What is a pool?")).toBeTruthy();
    expect(getByText("What is a Bond?")).toBeTruthy();
    expect(getByText("What is a Borrow Offer?")).toBeTruthy();
    expect(getByText("What is an Equity Token?")).toBeTruthy();
    expect(getByText("What is a Bond NFT?")).toBeTruthy();
    expect(getByText("More Useful Links")).toBeTruthy();
  })
  test("should have all test data elements", () => {
    const { getAllByTestId} = render(<Faq />);
    const accordion = getAllByTestId("accordion");
    faqContent.map(element => expect(within(accordion[0]).getByText(element.text)));
  })
})