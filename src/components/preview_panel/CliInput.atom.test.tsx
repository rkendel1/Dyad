import { render, screen, waitFor } from "@testing-library/react";
import { Provider, useAtom, useSetAtom } from "jotai";
import { selectedAppIdAtom, cliInputTextAtom } from "@/atoms/appAtoms";
import { CliInput } from "./CliInput";
import { IpcClient } from "@/ipc/ipc_client";

// Mock IpcClient
jest.mock("@/ipc/ipc_client", () => ({
  IpcClient: {
    getInstance: jest.fn(() => ({
      respondToAppInput: jest.fn(),
    })),
  },
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("CliInput Component with Atom Integration", () => {
  const renderCliInputWithAtom = (appId: number | null = 1) => {
    const TestComponent = () => {
      const setCliInputText = useSetAtom(cliInputTextAtom);

      return (
        <div>
          <button
            onClick={() => setCliInputText("test selector value")}
            data-testid="set-cli-text-button"
          >
            Set CLI Text
          </button>
          <CliInput />
        </div>
      );
    };

    return render(
      <Provider initialValues={[[selectedAppIdAtom, appId]]}>
        <TestComponent />
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts text from cliInputTextAtom and populates input", async () => {
    renderCliInputWithAtom();

    const input = screen.getByPlaceholderText(
      /Enter command or app input.../,
    ) as HTMLInputElement;

    // Initially empty
    expect(input.value).toBe("");

    // Click button to set text via atom
    const setButton = screen.getByTestId("set-cli-text-button");
    setButton.click();

    // Wait for the input to be populated
    await waitFor(() => {
      expect(input.value).toBe("test selector value");
    });

    // Input should be focused after insertion
    expect(document.activeElement).toBe(input);
  });

  it("clears the atom after inserting text", async () => {
    const TestComponent = () => {
      const [cliInputText] = useAtom(cliInputTextAtom);
      const setCliInputText = useSetAtom(cliInputTextAtom);

      return (
        <div>
          <button
            onClick={() => setCliInputText("test value")}
            data-testid="set-cli-text-button"
          >
            Set CLI Text
          </button>
          <div data-testid="atom-value">{cliInputText || "null"}</div>
          <CliInput />
        </div>
      );
    };

    render(
      <Provider initialValues={[[selectedAppIdAtom, 1]]}>
        <TestComponent />
      </Provider>,
    );

    // Initially null
    expect(screen.getByTestId("atom-value")).toHaveTextContent("null");

    // Set text via atom
    const setButton = screen.getByTestId("set-cli-text-button");
    setButton.click();

    // Wait for the atom to be cleared
    await waitFor(() => {
      expect(screen.getByTestId("atom-value")).toHaveTextContent("null");
    });
  });

  it("handles null value from atom gracefully", () => {
    const TestComponent = () => {
      const setCliInputText = useSetAtom(cliInputTextAtom);

      return (
        <div>
          <button
            onClick={() => setCliInputText(null)}
            data-testid="set-null-button"
          >
            Set Null
          </button>
          <CliInput />
        </div>
      );
    };

    render(
      <Provider initialValues={[[selectedAppIdAtom, 1]]}>
        <TestComponent />
      </Provider>,
    );

    const input = screen.getByPlaceholderText(
      /Enter command or app input.../,
    ) as HTMLInputElement;

    // Set some initial value
    input.value = "initial";

    // Set null via atom
    const setNullButton = screen.getByTestId("set-null-button");
    setNullButton.click();

    // Input should not change when null is set
    expect(input.value).toBe("initial");
  });
});
