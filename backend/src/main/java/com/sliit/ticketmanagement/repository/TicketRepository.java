package com.sliit.ticketmanagement.repository;

import com.sliit.ticketmanagement.model.TicketModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<TicketModel, Long> {
}