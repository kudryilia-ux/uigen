import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function makeTool(overrides: Record<string, unknown> = {}) {
  return {
    toolCallId: "t1",
    toolName: "str_replace_editor",
    args: {} as Record<string, unknown>,
    state: "result",
    result: "Success",
    ...overrides,
  };
}

test("getToolLabel returns 'Created filename' for create command", () => {
  const label = getToolLabel(
    makeTool({ args: { command: "create", path: "/components/Card.jsx" } })
  );
  expect(label).toBe("Created Card.jsx");
});

test("getToolLabel returns 'Edited filename' for str_replace command", () => {
  const label = getToolLabel(
    makeTool({ args: { command: "str_replace", path: "/App.jsx" } })
  );
  expect(label).toBe("Edited App.jsx");
});

test("getToolLabel returns 'Edited filename' for insert command", () => {
  const label = getToolLabel(
    makeTool({ args: { command: "insert", path: "/utils/helpers.js" } })
  );
  expect(label).toBe("Edited helpers.js");
});

test("getToolLabel returns 'Viewed filename' for view command", () => {
  const label = getToolLabel(
    makeTool({ args: { command: "view", path: "/App.jsx" } })
  );
  expect(label).toBe("Viewed App.jsx");
});

test("getToolLabel returns 'Reverted filename' for undo_edit command", () => {
  const label = getToolLabel(
    makeTool({ args: { command: "undo_edit", path: "/App.jsx" } })
  );
  expect(label).toBe("Reverted App.jsx");
});

test("getToolLabel returns 'Renamed filename' for file_manager rename", () => {
  const label = getToolLabel(
    makeTool({
      toolName: "file_manager",
      args: { command: "rename", path: "/old.jsx" },
    })
  );
  expect(label).toBe("Renamed old.jsx");
});

test("getToolLabel returns 'Deleted filename' for file_manager delete", () => {
  const label = getToolLabel(
    makeTool({
      toolName: "file_manager",
      args: { command: "delete", path: "/temp.jsx" },
    })
  );
  expect(label).toBe("Deleted temp.jsx");
});

test("getToolLabel returns 'Updated files' when args are empty", () => {
  const label = getToolLabel(makeTool({ args: {} }));
  expect(label).toBe("Updated files");
});

test("getToolLabel uses in-progress labels when state is not result", () => {
  const label = getToolLabel(
    makeTool({
      state: "call",
      result: undefined,
      args: { command: "create", path: "/Button.jsx" },
    })
  );
  expect(label).toBe("Creating Button.jsx");
});

test("getToolLabel uses in-progress fallback for unknown tool", () => {
  const label = getToolLabel(
    makeTool({
      toolName: "unknown_tool",
      state: "call",
      result: undefined,
      args: {},
    })
  );
  expect(label).toBe("Updating files");
});

test("ToolCallBadge renders completed state with green dot", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeTool({
        args: { command: "create", path: "/Card.jsx" },
      })}
    />
  );

  expect(screen.getByText("Created Card.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
});

test("ToolCallBadge renders in-progress state with spinner", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeTool({
        state: "call",
        result: undefined,
        args: { command: "str_replace", path: "/App.jsx" },
      })}
    />
  );

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});
