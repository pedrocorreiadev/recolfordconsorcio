const archivedPayload = {
  archived: true,
  error: "As campanhas dinâmicas foram desativadas porque o projeto ficou apenas como protótipo front-end.",
};

function archivedResponse() {
  return Response.json(archivedPayload, { status: 410 });
}

export function GET() {
  return archivedResponse();
}

export function POST() {
  return archivedResponse();
}

export function PATCH() {
  return archivedResponse();
}

export function DELETE() {
  return archivedResponse();
}
