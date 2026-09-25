package com.superdev.foodmanager.controllers;

import com.superdev.foodmanager.dtos.cliente.ClienteAtualizarDto;
import com.superdev.foodmanager.dtos.cliente.ClienteCriarDto;
import com.superdev.foodmanager.models.Cliente;
import com.superdev.foodmanager.services.ClienteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {
    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cliente> listar(){
        return service.listar();
    }

    @PostMapping
    public Cliente criar(@RequestBody @Valid ClienteCriarDto dto){
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable int id,
         @RequestBody @Valid ClienteAtualizarDto dto){
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public Cliente apagar(@PathVariable int id){
        return service.apagar(id);
    }

    @GetMapping("/{id}")
    public Cliente obterPorId(@PathVariable int id){
        return service.obterPorId(id);
    }

}
