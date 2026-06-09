import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "NilTab <nildornellas@gmail.com>",
      to: "iannilo01@gmail.com",
      subject: "Teste de assunto",
      text: "Test de corpo.",
    });

    await email.send({
      from: "NilTab <nildornellas@gmail.com>",
      to: "iannilo01@gmail.com",
      subject: "Último email enviado",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<nildornellas@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<iannilo01@gmail.com>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email.\r\n");
  });
});
