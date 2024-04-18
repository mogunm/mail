document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // submit the values of the form field to the backend 
  document.querySelector('#compose-form').addEventListener('submit', send_email);

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // getting the list of emails back from the API 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then((data) => {
    
    // create the list of emails from the API 
    data.forEach(singleEmail => {
      const email = document.createElement('div');
      email.className = `list-group`;
      email.innerHTML = `
      <a class="list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">${singleEmail.sender}</h5>
          <small>${singleEmail.timestamp}</small>
        </div>
        <p class="mb-1">${singleEmail.subject}</p>
      </a>
      `;
      // when email is clicked display the inner details of email 
      email.addEventListener('click',  () => view_email(singleEmail.id));

      // add each email to the div for the view 
      document.querySelector('#emails-view').append(email);
    });

  });

}

function send_email(event) {

  // prevent default submission 
  event.preventDefault()

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

    // submit email data to the backend 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // log the results message to the console 
    console.log(result);
     // By default, load the sent mailbox 
    load_mailbox('sent');
  });
}

function view_email(emailId) {

  // fetch the individual email when clicking on it 
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(data => {
    // show the individual email view and hide the others 
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // create the view for the individual email 
    document.querySelector('#email-view').innerHTML = `
     <div id="email-detail" class=" d-flex flex-column">
        <div><strong>From:</strong> ${data.sender}</div>
        <div><strong>To:</strong> ${data.recipients}</div>
        <div><strong>Subject:</strong> ${data.subject}</div>
        <div><strong>Timestamp:</strong> ${data.timestamp}</div>
        <div><input type="submit" value="reply" class="btn btn-sm btn-outline-primary"</div>
     </div>
     <div class="border-bottom mt-1">
     </div>
     <div class="mt-3">
        <p>${data.body}</p>
     </div>
    `

    // mark the email as read 
    fetch(`/emails/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });

    //allow for user to archive emails 
    const button = document.createElement('button');
    button.className = data.archived ? "btn btn-sm btn-outline-danger mb-2" : "btn btn-sm btn-outline-success mb-2";
    button.innerHTML = data.archived ? "unarchive" : "archive";
    button.onclick = () => {
      fetch(`/emails/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !data.archived
        })
      })
      .then(() => {load_mailbox('archive')});
    };
    document.querySelector('.border-bottom').append(button);

  });

  

}