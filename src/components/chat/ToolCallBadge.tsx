import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

const completedLabels: Record<string, Record<string, string>> = {
  str_replace_editor: {
    create: "Created",
    str_replace: "Edited",
    insert: "Edited",
    view: "Viewed",
    undo_edit: "Reverted",
  },
  file_manager: {
    rename: "Renamed",
    delete: "Deleted",
  },
};

const inProgressLabels: Record<string, Record<string, string>> = {
  str_replace_editor: {
    create: "Creating",
    str_replace: "Editing",
    insert: "Editing",
    view: "Viewing",
    undo_edit: "Reverting",
  },
  file_manager: {
    rename: "Renaming",
    delete: "Deleting",
  },
};

export function getToolLabel(tool: ToolInvocation): string {
  const isCompleted = tool.state === "result" && tool.result;
  const labels = isCompleted ? completedLabels : inProgressLabels;
  const command = tool.args?.command as string | undefined;
  const path = tool.args?.path as string | undefined;

  const filename = path ? path.split("/").pop() : undefined;
  const verb =
    labels[tool.toolName]?.[command ?? ""] ??
    (isCompleted ? "Updated" : "Updating");

  return filename ? `${verb} ${filename}` : `${verb} files`;
}

export function ToolCallBadge({ toolInvocation: tool }: ToolCallBadgeProps) {
  const isCompleted = tool.state === "result" && tool.result;
  const label = getToolLabel(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
