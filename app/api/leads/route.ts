const archivedPayload = {
  archived: true,
  error: "A captação de leads foi desativada porque o projeto não avançou para operação.",
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
