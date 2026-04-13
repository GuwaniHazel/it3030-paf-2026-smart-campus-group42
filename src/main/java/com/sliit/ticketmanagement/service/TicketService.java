package com.sliit.ticketmanagement.service;

import com.sliit.ticketmanagement.model.TicketModel;
import com.sliit.ticketmanagement.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public TicketModel createTicket(TicketModel ticketModel) {
        return ticketRepository.save(ticketModel);
    }

    public List<TicketModel> getAllTickets() {
        return ticketRepository.findAll();
    }

    public TicketModel getTicketById(Long id) {
        Optional<TicketModel> ticket = ticketRepository.findById(id);
        return ticket.orElse(null);
    }
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}