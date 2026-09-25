package com.superdev.foodmanager.controllers;

import com.superdev.foodmanager.dtos.pedido.PedidoAtualizarDto;
import com.superdev.foodmanager.dtos.pedido.PedidoCriarDto;
import com.superdev.foodmanager.models.Pedido;
import com.superdev.foodmanager.services.PedidoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")

public class PedidoController {
    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pedido> listar(){
        return service.listar();
    }

    @PostMapping
    public Pedido criar(@RequestBody @Valid PedidoCriarDto dto){
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public Pedido atualizar(@PathVariable int id,
                             @RequestBody @Valid PedidoAtualizarDto dto){
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public Pedido apagar(@PathVariable int id){
        return service.apagar(id);
    }

    @GetMapping("/{id}")
    public Pedido obterPorId(@PathVariable int id){
        return service.obterPorId(id);
    }

}
