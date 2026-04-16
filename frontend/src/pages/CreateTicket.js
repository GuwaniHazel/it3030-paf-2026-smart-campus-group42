import { useState } from "react";

function CreateTicket({ onSuccess }) {
  const [ticket, setTicket] = useState({
    title: "",
    category: "",
    description: "",
    priority: "",
    preferredContact: ""
  });

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ticket)
      });

      const data = await response.json();
      console.log("Created:", data);

      alert("Ticket created successfully!");

      setTicket({
        title: "",
        category: "",
        description: "",
        priority: "",
        preferredContact: ""
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert("Error creating ticket");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Ticket</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={ticket.title}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          name="category"
          placeholder="Category"
          value={ticket.category}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <textarea
          name="description"
          placeholder="Description"
          value={ticket.description}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          name="priority"
          placeholder="Priority"
          value={ticket.priority}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          name="preferredContact"
          placeholder="Preferred Contact"
          value={ticket.preferredContact}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit">Create Ticket</button>
      </form>
    </div>
  );
}

export default CreateTicket;