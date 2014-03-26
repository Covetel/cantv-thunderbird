#!/usr/bin/env perl
use HTTP::Request;
use LWP::UserAgent;
use JSON;
use Data::Dumper;

my $hash = { uid => 'rdeoli01' };

my $json = JSON->new; 

my $data = encode_json($hash);

my $url = "http://192.168.213.120/rest/forward_AD/";

my $req = HTTP::Request->new(POST => $url);
$req->content_type('application/json');
$req->content($data);

my $ua = LWP::UserAgent->new; # You might want some options here
my $res = $ua->request($req);
print "Datos Enviados: \n";
print $json->pretty->encode($hash),  "\n";

print "Datos Recibidos: \n";
print $json->pretty->encode($json->decode($res->decoded_content)) ,  "\n";
print "HTTP Code: " ,  $res->code ,  "\n";
