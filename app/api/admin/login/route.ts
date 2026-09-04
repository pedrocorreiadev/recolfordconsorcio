export function POST() {
  return Response.json(
    {
      archived: true,
      error: "O login administrativo foi desativado porque o backoffice não entrou em operação.",
    },
    { status: 410 },
  );
}
