package com.superdev.foodmanager.repositories;

import com.superdev.foodmanager.models.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
}
