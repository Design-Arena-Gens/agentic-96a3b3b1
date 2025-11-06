import CodeBlock from "../components/CodeBlock";

const delugeAuth = `// 1) Configure Zoho Sign connection (Creator > Settings > Connections)
// Create an OAuth connection to Zoho Sign with the following scopes:
//   - ZohoSign.account.ALL
//   - ZohoSign.document.ALL
//   - ZohoSign.template.ALL
// Name it: zoho_sign_conn

// Optional: Store organization_id in a Creator app variable
orgId = "YOUR_ZOHO_SIGN_ORG_ID";`;

const delugeCreateFromTemplate = `// Create document from a Zoho Sign template and send for signature
// Assumes a Connection named 'zoho_sign_conn'

signHost = "https://sign.zoho.com/api/v1";

payload = {
	"templates": [{
		"actions": [{
			"recipient": {
				"name": input.Recipient_Name,
				"email": input.Recipient_Email
			},
			"action_type": "SIGN",
			"private_notes": "Please sign at your earliest convenience"
		}],
		"template_id": input.Template_Id,
		"request_name": "Agreement for " + input.Recipient_Name,
		"expiry_days": 7,
		"email_reminders": true,
		"reminder_period": 2
	}]
};

resp = invokeurl
[
	url : signHost + "/templates"
	type : POST
	parameters: payload.toString()
	connection : "zoho_sign_conn"
	content-type : "application/json"
];

if(resp.get("status") == "success")
{
	// Save request_id to the record
	thisapp.Your_Form.update(input.ID)
	.set("Zoho_Sign_Request_Id", resp.get("requests").get(0).get("request_id"))
	.submit();
}
else
{
	info resp;
	throw "Failed to create Zoho Sign request";
}`;

const delugeGetEmbeddedLink = `// Get embedded signing link for a recipient
signHost = "https://sign.zoho.com/api/v1";

requestId = input.Zoho_Sign_Request_Id;
recipientEmail = input.Recipient_Email;

resp = invokeurl
[
	url: signHost + "/requests/" + requestId + "/actions"
	type: GET
	connection: "zoho_sign_conn"
];

actions = resp.get("actions");
for each  act in actions
{
	if(act.get("recipient_email") == recipientEmail)
	{
		// Embedded signing URL
		linkResp = invokeurl
		[
			url: signHost + "/requests/" + requestId + "/actions/" + act.get("action_id") + "/embedtoken"
			type: POST
			parameters: {"host":"creatorapp.zoho.com"}.toString()
			connection: "zoho_sign_conn"
			content-type: "application/json"
		];
		
		if(linkResp.get("status") == "success")
		{
			thisapp.Your_Form.update(input.ID)
			.set("Embedded_Signing_URL", linkResp.get("sign_url"))
			.submit();
		}
	}
}`;

const delugeWebhook = `// Configure a webhook in Zoho Sign (Settings > Webhooks) pointing to a Creator Workflow Webhook URL
// Event: Document Completed / Declined / Expired

// Sample Creator workflow function handling webhook JSON
requestJson = zoho.currentrequest.get("requestBody");
payload = requestJson.toMap();

requestId = payload.get("request_id");
status = payload.get("request_status");

// Update matching record
recs = thisapp.Your_Form[Zoho_Sign_Request_Id == requestId];
if(recs.count() > 0)
{
	rec = recs.get(0);
	rec.Request_Status = status;
	rec.Submitted_On = zoho.currenttime;
}

return {"ok":true};`;

const delugeDirectDoc = `// Create a document on-the-fly and send for signature (no template)
signHost = "https://sign.zoho.com/api/v1";

pdfUrl = "https://example.com/sample.pdf"; // OR generate via Writer/Creator

payload = {
	"requests": [{
		"request_name": "NDA - " + input.Recipient_Name,
		"actions": [{
			"recipient": {
				"name": input.Recipient_Name,
				"email": input.Recipient_Email
			},
			"action_type": "SIGN"
		}],
		"files": [{
			"file_url": pdfUrl
		}],
		"is_sequential": true,
		"email_reminders": true,
		"reminder_period": 3,
		"expiry_days": 10
	}]
};

resp = invokeurl
[
	url : signHost + "/requests"
	type : POST
	parameters: payload.toString()
	connection : "zoho_sign_conn"
	content-type : "application/json"
];

info resp;`;

const envNotes = `// Notes:
// - In Creator, create an OAuth Connection to Zoho Sign (zoho_sign_conn)
// - Add scopes: ZohoSign.account.ALL, ZohoSign.document.ALL, ZohoSign.template.ALL
// - For EU/IN/AU domains use the corresponding sign host: https://sign.zoho.eu, https://sign.zoho.in, etc.
// - Replace Your_Form and field API names with your schema
// - For embedded signing host, use your Creator domain host
// - For production, check response errors and add retry/backoff
`;

export default function Page() {
  return (
    <div>
      <div className="hero">
        <span className="badge">Zoho Sign ? Zoho Creator ? Deluge</span>
        <h1 className="h1">Integrate Zoho Sign with Zoho Creator using Deluge</h1>
        <p className="subtitle">Copy?pasteable Deluge examples: create requests from templates, embedded signing, and webhooks.</p>
      </div>

      <section className="section">
        <h2>1) Prerequisites and Auth</h2>
        <p>Create a Zoho Sign OAuth Connection in Creator and capture your organization ID. Name the connection <span className="kbd">zoho_sign_conn</span>.</p>
        <div className="card">
          <CodeBlock code={delugeAuth} />
        </div>
      </section>

      <section className="section">
        <h2>2) Create a request from a Template</h2>
        <p>Trigger from a button or workflow in your form to generate and send a document from a Zoho Sign template.</p>
        <div className="card">
          <CodeBlock code={delugeCreateFromTemplate} />
        </div>
      </section>

      <section className="section">
        <h2>3) Embedded Signing URL</h2>
        <p>Fetch the recipient action and generate an embedded signing URL to show inside Creator.</p>
        <div className="card">
          <CodeBlock code={delugeGetEmbeddedLink} />
        </div>
      </section>

      <section className="section">
        <h2>4) Webhook to update record status</h2>
        <p>Configure a Zoho Sign webhook to call a Creator workflow URL and update the matching record.</p>
        <div className="card">
          <CodeBlock code={delugeWebhook} />
        </div>
      </section>

      <section className="section">
        <h2>5) Optional: Send without a template</h2>
        <p>Construct a request dynamically by providing a file URL and recipient details.</p>
        <div className="card">
          <CodeBlock code={delugeDirectDoc} />
        </div>
      </section>

      <section className="section">
        <h2>Environment and Domain Notes</h2>
        <div className="card">
          <CodeBlock code={envNotes} />
        </div>
      </section>
    </div>
  );
}
